vcl 4.1;

backend default {
    .host = "nginx";
    .port = "80";
}

sub vcl_recv {
    # Called after a request has been received, but before it has been processed.
    # Typically, you'll decide whether to serve the request from cache or pass it to the backend.
}

sub vcl_backend_response {
    # Called after the response has been retrieved from the backend.
    # This is where you can modify the response before it's delivered to the client.
}

sub vcl_deliver {
    # Called before the object is delivered to the client.
}