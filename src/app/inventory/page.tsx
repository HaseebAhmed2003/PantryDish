'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getFirestore, collection, getDocs, Firestore, query, where } from "firebase/firestore";
import firebaseConfig from "@/app/firebase/config";
import { initializeApp } from 'firebase/app';
import { useUser } from "@clerk/nextjs";

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  weight: string;
}

export default function InventoryPage() {
  const { user } = useUser();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPantryItems();
    }
  }, [user]);

const fetchPantryItems = async () => {
    if (!user) return;
    const q = query(collection(db, 'pantryItems'), where("userId", "==", user.id));
    const querySnapshot = await getDocs(q);
    const items: PantryItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ 
        id: doc.id,
        name: doc.data().name,
        quantity: doc.data().quantity,
        weight: doc.data().weight || 'g'
      });
    });
    setPantryItems(items);
  };

  const filteredItems = pantryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => {
    const doc = new jsPDF();
    
    doc.text('Inventory Report', 14, 15);
    
    const tableColumn = ["Product Name", "Quantity", "Weight"];
    const tableRows = filteredItems.map(item => [item.name, item.quantity, item.weight]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });

    doc.save('inventory.pdf');

    toast({
      title: "Inventory Downloaded",
      description: "Your inventory has been successfully downloaded as a PDF.",
    });
  };

  if (!user) {
    return <div>Please sign in to view your inventory.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto mb-2 sm:mb-0"
            />
            <Button onClick={handleDownload} className="w-full sm:w-auto">Download PDF</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Product Name</TableHead>
                  <TableHead className="w-1/3">Quantity</TableHead>
                  <TableHead className="w-1/3">Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="w-1/3">{item.name}</TableCell>
                    <TableCell className="w-1/3">{item.quantity}</TableCell>
                    <TableCell className="w-1/3">{item.weight}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}