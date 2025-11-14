FROM varnish:stable
COPY ./performance/varnish.vcl/default.vcl /etc/varnish/default.vcl