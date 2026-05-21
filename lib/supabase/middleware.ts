import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/signup');

  const isPublicFile = request.nextUrl.pathname.startsWith('/_next') || 
                       request.nextUrl.pathname.includes('.');

  // Si no es una ruta de autenticación y no es un archivo público, requerimos sesión
  // if (!user && !isAuthRoute && !isPublicFile) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  // Si ya tiene sesión y trata de ir al login, lo mandamos al dashboard
  // if (user && isAuthRoute) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/dashboard'
  //   return NextResponse.redirect(url)
  // }

  return supabaseResponse
}
