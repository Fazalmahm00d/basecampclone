import { Card, CardContent } from "@/components/ui/card";

export default function Assignments() {
  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">Your Assignments</h2>
      <Card>
        <CardContent>
          <p className="text-sm">
            You don’t have any assignments right now. To-dos and cards assigned to you will show up here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
