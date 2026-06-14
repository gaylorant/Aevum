import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ['/login', '/signup', '/auth']
const isPublic = (path: string) => PUBLIC_ROUTES.some(r => path.startsWith(r))

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  );

  // getUser() validates server-side — never use getSession() at auth boundaries
  const { data: { user } } = await supabase.auth.getUser();

  // Logged in → bounce away from login/signup
  if (user && isPublic(pathname)) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // Not logged in → protect onboarding and app routes
  if (!user && !isPublic(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response;
}

export const config = {
  // Covers everything except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};