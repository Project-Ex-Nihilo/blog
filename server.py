import http.server
import socketserver
import os

PORT = 8000

class SPARequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        file_path = self.translate_path(self.path)

        if os.path.exists(file_path) and not os.path.isdir(file_path):
            return super().do_GET()

        self.path = "/404.html"
        return super().do_GET()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), SPARequestHandler) as httpd:
        httpd.timeout = 0.5
        print(f"Starting server at http://localhost:{PORT}")
        try:
            while True:
                httpd.handle_request()
        except KeyboardInterrupt:
            print("\nShutting down server...")