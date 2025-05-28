import { NextRequest, NextResponse } from 'next/server';

// The base URL of the API we want to proxy to
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Add diagnostics and retry functionality
const DEBUG = true;
const MAX_RETRIES = 2;
const RETRY_DELAY = 500; // ms

// Helper function to log conditionally
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log(...args);
  }
}

// Helper to wait for a specified time
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * This is a proxy API route that forwards requests to the actual API
 * It helps bypass CORS restrictions during local development
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathParams = await params;
  const path = pathParams.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;
  
  // Forward the request to the API
  const response = await fetch(`${API_BASE_URL}/${path}${queryString}`, {
    headers: {
      'Content-Type': 'application/json',
      // Forward the authorization header if present
      ...(request.headers.get('authorization')
        ? { 'Authorization': request.headers.get('authorization')! }
        : {}),
    },
    cache: 'no-store',
  });

  // Get the response data
  const data = await response.json();

  // Return the response with appropriate headers
  return NextResponse.json(data, {
    status: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathParams = await params;
  const path = pathParams.path.join('/');
  
  // Get authorization header once and preserve it throughout
  const authHeader = request.headers.get('authorization');
  
  // Check content type to determine how to handle the body
  const contentType = request.headers.get('content-type') || '';
  let fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      // Forward the authorization header if present
      ...(authHeader ? { 'Authorization': authHeader } : {}),
    },
  };
  
  // Handle form-urlencoded data (for login)
  if (contentType.includes('application/x-www-form-urlencoded') || 
      contentType.includes('multipart/form-data')) {
    
    // Special handling for login endpoint - API requires username (email) & password as form-urlencoded
    if (path === 'auth/login') {
      debugLog('Special handling for login endpoint');
      
      // Try to get data in different formats
      let username = '';
      let password = '';
      let requestText = '';
      
      try {
        // Clone the request for potential fallback parsing methods
        const requestClone = request.clone();
        
        // Try to get from URLSearchParams (application/x-www-form-urlencoded)
        requestText = await request.text();
        debugLog('Raw request text:', requestText);
        
        // First attempt: Try parsing as URLSearchParams
        const urlParams = new URLSearchParams(requestText);
        debugLog('Request as URLSearchParams:', urlParams.toString());
        
        username = urlParams.get('username') || urlParams.get('email') || '';
        password = urlParams.get('password') || '';
        
        debugLog('Got from URLSearchParams - username:', username ? 'present' : 'missing', 'password:', password ? 'present' : 'missing');
        
        // Second attempt: If username is still missing and text looks like JSON, try parsing as JSON
        if (!username && requestText.trim().startsWith('{')) {
          try {
            const jsonData = JSON.parse(requestText);
            username = jsonData.username || jsonData.email || '';
            password = jsonData.password || '';
            debugLog('Extracted from JSON - username:', username ? 'present' : 'missing', 'password:', password ? 'present' : 'missing');
          } catch (jsonError) {
            debugLog('Not valid JSON, continuing with form handling');
          }
        }
      } catch (e) {
        debugLog('Failed to parse as URLSearchParams or JSON, trying FormData');
        
        // Third attempt: Try FormData as last resort
        try {
          const formData = await request.clone().formData().catch(() => new FormData());
          debugLog('Form data keys:', [...formData.keys()]);
          
          username = (formData.get('username') || formData.get('email') || '').toString();
          password = (formData.get('password') || '').toString();
          
          debugLog('Got from FormData - username/email:', username ? 'present' : 'missing', 'password:', password ? 'present' : 'missing');
        } catch (formError) {
          console.error('Failed to parse request as FormData:', formError);
        }
      }
      
      // Create URLSearchParams to send to the API (API requires form-urlencoded)
      const formBody = new URLSearchParams();
      
      if (username && password) {
        // API specifically requires 'username' param even though it's an email
        formBody.append('username', username);
        formBody.append('password', password);
        debugLog('Proxying login data with username present');
      } else {
        console.error('Missing username/email or password in request data');
        return NextResponse.json({ 
          error: 'Missing username or password in the request. Please check your input and try again.',
          details: 'The login endpoint requires both username (or email) and password fields.' 
        }, { status: 400 });
      }
      
      // Setup proper headers according to API docs - preserve auth header
      fetchOptions.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        // Preserve authorization header
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      };
      fetchOptions.body = formBody;
      
      // Ensure there are no duplicate content-type headers
      // Some browsers might add this automatically
      if (request.headers.has('content-type')) {
        debugLog('Original content-type:', request.headers.get('content-type'));
      }
    } else {
      // Regular form data handling for other endpoints
      const formData = await request.formData();
      
      // Check if FormData contains files
      let hasFiles = false;
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          hasFiles = true;
          break;
        }
      }
      
      if (hasFiles) {
        // If FormData contains files, forward it as-is (multipart/form-data)
        console.log('Proxying form data with files - keeping as FormData');
        
        fetchOptions.headers = {
          // Preserve authorization header
          ...(authHeader ? { 'Authorization': authHeader } : {}),
          // Don't set Content-Type - let fetch set it with proper boundary
        };
        fetchOptions.body = formData;
      } else {
        // If no files, convert to URLSearchParams (form-urlencoded)
        const formBody = new URLSearchParams();
        
        // Convert FormData to URLSearchParams
        formData.forEach((value, key) => {
          formBody.append(key, value.toString());
        });
        
        console.log('Proxying form data:', formBody.toString());
        
        fetchOptions.headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Preserve authorization header
          ...(authHeader ? { 'Authorization': authHeader } : {}),
        };
        fetchOptions.body = formBody;
      }
    }
  } 
  // Handle JSON data (for registration and other endpoints)
  else {
    const body = await request.json().catch(() => ({}));
    console.log('Proxying JSON data:', body);
    
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      // Preserve authorization header
      ...(authHeader ? { 'Authorization': authHeader } : {}),
    };
    fetchOptions.body = JSON.stringify(body);
  }
  
  console.log(`Forwarding ${contentType} request to ${API_BASE_URL}/${path}`)
  console.log('Request options:', JSON.stringify({
    method: fetchOptions.method,
    headers: fetchOptions.headers,
    body: fetchOptions.body instanceof URLSearchParams ? fetchOptions.body.toString() : 
          fetchOptions.body instanceof FormData ? 'FormData with files' :
          typeof fetchOptions.body === 'string' ? fetchOptions.body : 'Buffer or other'
  }, null, 2))
  
  // Forward the request to the API
  // Implement retry logic and improved error handling for the API requests
  async function makeRequestWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      // Only retry on 5xx server errors or network failures
      if (response.status >= 500 && retries > 0) {
        debugLog(`Received ${response.status} from API, retrying... (${retries} attempts left)`);
        await wait(RETRY_DELAY);
        return makeRequestWithRetry(url, options, retries - 1);
      }
      
      return response;
    } catch (error) {
      // Retry on network errors
      if (retries > 0) {
        debugLog(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}, retrying... (${retries} attempts left)`);
        await wait(RETRY_DELAY);
        return makeRequestWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }
  
  try {
    // Special debug for login
    if (path === 'auth/login') {
      debugLog('About to fetch login endpoint with options:', {
        url: `${API_BASE_URL}/${path}`,
        method: fetchOptions.method,
        headers: fetchOptions.headers,
        bodyType: typeof fetchOptions.body,
        bodyPreview: fetchOptions.body instanceof URLSearchParams ? fetchOptions.body.toString() : '[binary data]'
      });
    }
    
    // Use retry logic for all API requests
    const response = await makeRequestWithRetry(`${API_BASE_URL}/${path}`, fetchOptions);
    
    debugLog(`Response status: ${response.status}`);
    
    // Clone the response for logging
    const clonedResponse = response.clone();
    
    try {
      const responseBody = await clonedResponse.text();
      debugLog(`Response body: ${responseBody}`);
      
      // Special handling for auth/login endpoint
      if (path === 'auth/login') {
        try {
          // For 500 errors, provide more helpful diagnostics about the backend
          if (response.status === 500) {
            console.error(`Authentication server error (500). Request: ${fetchOptions.body instanceof URLSearchParams ? fetchOptions.body.toString() : 'unknown format'}`);
            
            // Try to parse the error response
            try {
              const errorData = JSON.parse(responseBody);
              return NextResponse.json({
                error: errorData.detail || 'Authentication server error',
                status: 500,
                troubleshooting: [
                  "Check that your credentials are correct",
                  "The backend API might be experiencing issues",
                  "Try again later or contact support if the problem persists"
                ]
              }, { status: 500 });
            } catch (parseError) {
              return NextResponse.json({
                error: 'Authentication server error',
                raw_response: responseBody.substring(0, 200), // Limit to first 200 chars
                status: 500
              }, { status: 500 });
            }
          }
          
          // Handle successful responses
          if (response.ok) {
            let data: any;
            try {
              data = JSON.parse(responseBody);
            } catch (jsonError) {
              console.error('Login endpoint returned non-JSON response for a successful status:', responseBody);
              return NextResponse.json({
                error: 'Authentication service returned an invalid response format',
                status: 500
              }, { status: 500 });
            }
            
            // Validate the token exists
            if (!data.access_token && response.status === 200) {
              console.error('Login API returned 200 but no access_token was found in the response');
              return NextResponse.json({
                error: 'Authentication successful but token was missing from response',
                status: 500
              }, { status: 500 });
            }
            
            // Return successful login response
            return NextResponse.json(data, {
              status: response.status,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
            });
          }
          
          // Handle other error responses
          let errorData: any;
          try {
            errorData = JSON.parse(responseBody);
          } catch (e) {
            errorData = { detail: 'Unknown authentication error' };
          }
          
          return NextResponse.json({
            error: errorData.detail || `Authentication failed with status ${response.status}`,
            status: response.status
          }, { status: response.status });
        } catch (processError) {
          console.error('Error processing login response:', processError);
          return NextResponse.json({
            error: 'Error processing authentication response',
            status: 500
          }, { status: 500 });
        }
      }
      
      // Standard handling for other endpoints
      try {
        const data = JSON.parse(responseBody);
        return NextResponse.json(data, {
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } catch (jsonError) {
        // If not JSON, return text response
        return new NextResponse(responseBody, {
          status: response.status,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }
    } catch (textError) {
      console.error('Error reading response body:', textError);
      return NextResponse.json(
        { error: 'Failed to read response from API' },
        { status: 500 }
      );
    }
  } catch (fetchError: any) { // Using any to handle the unknown type
    console.error('Fetch error:', fetchError);
    return NextResponse.json(
      { error: `Proxy fetch error: ${fetchError.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathParams = await params;
  const path = pathParams.path.join('/');
  
  // Get the request body
  const body = await request.json().catch(() => ({}));
  
  // Forward the request to the API
  const response = await fetch(`${API_BASE_URL}/${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // Forward the authorization header if present
      ...(request.headers.get('authorization')
        ? { 'Authorization': request.headers.get('authorization')! }
        : {}),
    },
    body: JSON.stringify(body),
  });

  // Get the response data
  const data = await response.json();

  // Return the response with appropriate headers
  return NextResponse.json(data, {
    status: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathParams = await params;
  const path = pathParams.path.join('/');
  
  // Forward the request to the API
  const response = await fetch(`${API_BASE_URL}/${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // Forward the authorization header if present
      ...(request.headers.get('authorization')
        ? { 'Authorization': request.headers.get('authorization')! }
        : {}),
    },
  });

  // Get the response data
  const data = await response.json().catch(() => ({}));

  // Return the response with appropriate headers
  return NextResponse.json(data, {
    status: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
