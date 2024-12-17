
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";
import { MenuIcon, CookingPotIcon } from 'lucide-react';

const links = [
  {
    id: 0,
    text: "Home",
    url: "/"
  },
  {
    id: 1,
    text: "About",
    url: "/about"
  },
];

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 -6" />
            <span className="sr-only">Togggle Navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetTitle>
            <Link href="#" className="mr-6 lg:flex" prefetch={false}>
              <CookingPotIcon className="h-6 w-6" />
              <span className="sr-only">Grandma's Kitchen</span>
            </Link>
          </SheetTitle>
          <div className="grid gap-2 py-6">
            {links.map((link) => (
              <Link href={link.url} className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false} key={link.id}>
                {link.text}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/recipe/create" className="flex w-full items-center py-2 text-lg font-semibold" prefetch={false}>
                  Add a recipe
                </Link>
                <form action={signOutAction}>
                  <Button>
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="outline">
                  <Link href="/sign-in">
                    Sign In
                  </Link>
                </Button>
                <Button variant="default">
                  <Link href="/sign-up">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <Link href="/" className="mr-6 hidden lg:flex" prefetch={false}>
        <CookingPotIcon className="h-6 w-6" />
        <span className="sr-only">Grandma's Kitchen</span>
      </Link>
      <nav className="ml-auto hidden lg:flex gap-6">
        {links.map((link) => (
          <Link
            href={link.url}
            key={link.id}
            className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm
            font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none
            disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950
            dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50
            dark:data-[state=open]:bg-gray-800/50"
            prefetch={false}
          >
            {link.text}
          </Link>
        ))}
        {user ? (
          <>
            <Link
              href="/recipe/create"
              className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm
            font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none
            disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950
            dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50
            dark:data-[state=open]:bg-gray-800/50"
              prefetch={false}
            >
              Add a recipe
            </Link>
            <form action={signOutAction}>
              <Button>
                Sign Out
              </Button>
            </form>
          </>

        ) : (
          <>
            <Button variant="outline">
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
            <Button variant="default">
              <Link href="/sign-up">
                Sign Up
              </Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  )
}
