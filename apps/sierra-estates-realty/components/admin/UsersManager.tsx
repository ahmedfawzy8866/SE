"use client";
/**
 * UsersManager — table + role/status editor.
 * manager+ can view; admin can change role + status.
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Shield, UserCog } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/client/Toast";
import { DataTable, type Column } from "./DataTable";
import { fmtRelative } from "@/lib/format";
import { useAuth } from "@/components/client/AuthModal";
import type { Role, User, UserStatus } from "@/lib/types";

export function UsersManager() {
  const { me } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const canEdit = me?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await api.adminUsers()); }
    catch (err: any) { toast({ title: "Failed to load users", description: err.message, kind: "error" }); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  async function updateRole(uid: string, role: Role) {
    if (!canEdit) return;
    try {
      await api.adminUpdateUser(uid, { role });
      toast({ title: `Role updated → ${role}`, kind: "success" });
      await load();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, kind: "error" });
    }
  }
  async function updateStatus(uid: string, status: UserStatus) {
    if (!canEdit) return;
    try {
      await api.adminUpdateUser(uid, { status });
      toast({ title: `Status updated → ${status}`, kind: "success" });
      await load();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, kind: "error" });
    }
  }

  const columns: Column<User>[] = [
    {
      key: "name", header: "User", sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold text-sm">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{u.name}</p>
            <p className="text-xs text-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", header: "Role", sortable: true,
      render: (u) => (
        canEdit ? (
          <select
            value={u.role}
            onChange={(e) => updateRole(u.uid, e.target.value as Role)}
            className="input !py-1 !text-xs !w-32"
          >
            <option value="viewer">viewer</option>
            <option value="manager">manager</option>
            <option value="admin">admin</option>
          </select>
        ) : (
          <span className={`badge ${u.role === "admin" ? "badge-gold" : u.role === "manager" ? "badge-navy" : "badge-gray"}`}>
            {u.role === "admin" && <Shield className="h-3 w-3" />}
            {u.role}
          </span>
        )
      ),
    },
    {
      key: "status", header: "Status", sortable: true,
      render: (u) => (
        canEdit ? (
          <select
            value={u.status}
            onChange={(e) => updateStatus(u.uid, e.target.value as UserStatus)}
            className="input !py-1 !text-xs !w-32"
          >
            <option value="active">active</option>
            <option value="suspended">suspended</option>
            <option value="deleted">deleted</option>
          </select>
        ) : (
          <span className={u.status === "active" ? "badge-green" : u.status === "suspended" ? "badge-amber" : "badge-red"}>
            {u.status}
          </span>
        )
      ),
    },
    {
      key: "lastLogin", header: "Last login", sortable: true,
      sortValue: (u) => u.lastLogin ?? "",
      render: (u) => u.lastLogin ? fmtRelative(u.lastLogin) : "—",
    },
    {
      key: "createdAt", header: "Joined", sortable: true,
      sortValue: (u) => u.createdAt,
      render: (u) => fmtRelative(u.createdAt),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
          <UserCog className="h-5 w-5 text-gold-500" />
          Users
        </h1>
        <p className="text-sm text-muted mt-1">
          {items.length} total · {canEdit ? "you can change roles and status." : "view only — ask an admin to change roles."}
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : (
        <DataTable rows={items} columns={columns} searchKeys={["name", "email"]} />
      )}
    </div>
  );
}
