import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { Link } from "@inertiajs/react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-black">Meteroid Simulation</h1>
        <p className="text-balance text-sm text-gray-600">
          Welcome to the Meteroid Simulation powered by NASA database
        </p>
      </div>
      <div className="grid gap-6" style={{ padding: 10 }}>
        <Link href="/sim">
          <Button className="w-full" variant="outline">
            Start
          </Button>
        </Link>
      </div>

    </form>
  )
}
