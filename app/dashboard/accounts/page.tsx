"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt, FileText } from "lucide-react";
import Link from "next/link";
import SidebarLayout from "@/components/layout/sidebar-layout";
import api from "@/lib/api";

interface Account {
  id: number;
  account_name: string;
  account_number: string;
  created_at: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data.accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarLayout
      title="Accounts"
      description="Manage your accounting accounts"
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>
            Select an account to create vouchers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No accounts found</p>
              <Link href="/dashboard/accounts/create">
                <Button>Create Your First Account</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      {account.account_name}
                    </TableCell>
                    <TableCell>{account.account_number}</TableCell>
                    <TableCell>
                      {new Date(account.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/cash-voucher?account_id=${account.id}`}>
                          <Button size="sm" variant="outline">
                            <Receipt className="h-4 w-4 mr-2" />
                            Cash Voucher
                          </Button>
                        </Link>
                        <Link href={`/cheque-voucher?account_id=${account.id}`}>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Cheque Voucher
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </SidebarLayout>
  );
}
