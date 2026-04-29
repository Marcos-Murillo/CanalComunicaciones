"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateUserForm } from "@/components/create-user-form";
import { UserCredentialsDialog } from "@/components/user-credentials-dialog";
import { DeleteUserButton } from "@/components/delete-user-button";
import { useUsers } from "@/hooks/use-users";

export default function AdminManagersPage() {
  const { users, loading } = useUsers("manager");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Managers</h1>
        <p className="text-muted-foreground">Crea y gestiona los managers que envían peticiones</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear manager</CardTitle>
            <CardDescription>El manager puede enviar peticiones de eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateUserForm allowedRoles={["manager"]} defaultRole="manager" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Managers registrados</CardTitle>
            <CardDescription>{users.length} manager(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sin managers aún</p>
            ) : (
              users.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: u.color ?? "#6b7280" }}
                    />
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.area} · {u.cedula}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserCredentialsDialog name={u.name} cedula={u.cedula} password={u.password} />
                    <DeleteUserButton userId={u.id} userName={u.name} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
