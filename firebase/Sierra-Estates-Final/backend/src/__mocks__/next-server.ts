export class NextRequest extends Request {
  constructor(input: string | URL | Request, init?: RequestInit) {
    super(input instanceof Request ? input.url : String(input), init);
    // Mock standard NextRequest properties if needed
  }
}

export class NextResponse extends Response {
  static json(body: any, init?: ResponseInit) {
    const headers = new Headers(init?.headers);
    headers.set('content-type', 'application/json');
    return new Response(JSON.stringify(body), {
      ...init,
      headers,
    });
  }
}
