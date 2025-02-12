import { Card, CardContent } from "@/components/ui/card";

export default function RecentlyVisited() {
  return (
    <div className="flex flex-col justify-center items-center p-4">
      <h2 className="font-bold mb-4">Recently Visited</h2>
      <div className="flex flex-col sm:grid grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <h3 className="font-bold">Getting Started</h3>
            <p className="text-sm">Quickly get up to speed with everything Basecamp.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="font-bold">Making a Podcast</h3>
            <p className="text-sm">Showcasing how Basecamp helps make a podcast.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
