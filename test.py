import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
import socket
import json
import requests

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()

    def _html(self, message):
        """This just generates an HTML document that includes `message`
        in the body. Override, or re-write this do do more interesting stuff.
        """
        content = f"<html><body><h1>{message}</h1></body></html>"
        return content.encode("utf8")  # NOTE: must return a bytes object!

    def do_GET(self):
        self._set_headers()
        self.wfile.write(json.dumps({'test':'1'}).encode("utf8"))

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        
        print('POST')
        
        content = self.rfile.read(int(self.headers['Content-Length'])).decode('utf8')     
        
        url = "https://api.veryfi.com/api/v7/partner/documents/"

        cont = json.loads(content)

        if 'base64' in cont.keys():
            payload = "{\n\t\"file_name\": \"invoice.png\",\n\t\"file_data\": \"image/png;base64," + cont['base64'] + '"}'
            
            headers = {
              'CLIENT-ID': 'vrfXJJtRZMSOdYXenf4OlYEbgCD71YPzcCstgpJ',
              'AUTHORIZATION': 'apikey james8soucy:c155736b958bef1d8448b388d97964dd',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Content-Type': 'application/json',
              'Cookie': 'sessionid=dyrs2uockbeumdt7sap00hq6neg7ycea; csrftoken=694RbpLWio0H4FqbcA6Dvqb7Focq1GKN4mIad11p2Dsy0j8i7zctUjbhd6779doE'
            }

            print('making request')

            response = requests.request("POST", url, headers=headers, data = payload)
            
            self._set_headers()
            
            self.wfile.write(response.text.encode('utf8'))


def run(server_class=HTTPServer, handler_class=S, addr="10.0.0.33", port=8000):
    server_address = (addr, port)
    httpd = server_class(server_address, handler_class)

    print(f"Starting httpd server on {addr}:{port}")
    print(socket.gethostbyname(socket.gethostname()))
    httpd.serve_forever()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run a simple HTTP server")
    parser.add_argument(
        "-l",
        "--listen",
        default="10.0.0.33",
        help="Specify the IP address on which the server listens",
    )
    parser.add_argument(
        "-p",
        "--port",
        type=int,
        default=8000,
        help="Specify the port on which the server listens",
    )
    args = parser.parse_args()
    run(addr=args.listen, port=args.port)