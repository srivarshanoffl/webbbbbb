from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import sys

class DualStackServer(ThreadingHTTPServer):
    def server_bind(self):
        self.socket.setsockopt(65535, 4, 1) # SO_REUSEADDR
        super().server_bind()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = DualStackServer(('127.0.0.1', port), SimpleHTTPRequestHandler)
    print(f"Serving HTTP on 127.0.0.1 port {port} ...", flush=True)
    server.serve_forever()

