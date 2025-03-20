import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import CommandSearch from "@/components/command-search";
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
      <div className="flex w-full items-center justify-between">
        {/* Left side - Logo and mobile menu */}
        <div className="flex items-center">
          {/* Mobile Menu (shown only on small screens) */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="mr-2">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle Navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2" prefetch={false}>
                    <CookingPotIcon className="h-6 w-6" />
                    <span className="font-bold">Grandma's Kitchen</span>
                  </Link>
                </SheetTitle>

                <div className="grid gap-2 py-6">
                  {links.map((link) => (
                    <Link 
                      href={link.url} 
                      className="flex w-full items-center py-2 text-lg font-semibold" 
                      prefetch={false} 
                      key={link.id}
                    >
                      {link.text}
                    </Link>
                  ))}
                  {user ? (
                    <>
                      <Link 
                        href="/recipe/create" 
                        className="flex w-full items-center py-2 text-lg font-semibold" 
                        prefetch={false}
                      >
                        Add a recipe
                      </Link>
                      <form action={signOutAction}>
                        <Button className="w-full">
                          Sign Out
                        </Button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/sign-in">Sign In</Link>
                      </Button>
                      <Button variant="default" className="w-full justify-start" asChild>
                        <Link href="/sign-up">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Desktop Logo (hidden on small screens, visible on md and above) */}
          <Link href="/" className="hidden md:flex items-center gap-2" prefetch={false}>
            <CookingPotIcon className="h-6 w-6" />
            <span className="font-bold">Grandma's Kitchen</span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-auto">
          {/* <Search /> */}
          <CommandSearch />
        </div>

        {/* Right side - Navigation links (only on large screens) */}
        <nav className="hidden lg:flex items-center gap-4">
          {links.map((link) => (
            <Button 
              key={link.id} 
              variant="ghost" 
              asChild
            >
              <Link href={link.url} prefetch={false}>
                {link.text}
              </Link>
            </Button>
          ))}
          
          {user ? (
            <>
              <Button variant="outline" asChild>
                <Link href="/recipe/create" prefetch={false}>
                  Add a recipe
                </Link>
              </Button>
              <form action={signOutAction}>
                <Button>Sign Out</Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
