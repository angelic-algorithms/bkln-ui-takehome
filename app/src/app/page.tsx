import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>shadcn/ui Test</CardTitle>
          <CardDescription>Testing if components are working</CardDescription>
        </CardHeader>
        <CardContent>
          <p>If you can see this card with styling, everything is working!</p>
        </CardContent>
        <CardFooter>
          <Button className="bg-custom-gold text-black hover:bg-custom-gold/90">Gold Button</Button>
        </CardFooter>
      </Card>
    </main>
  )
}
