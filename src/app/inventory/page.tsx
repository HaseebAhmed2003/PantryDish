'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../pantry/page';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PantryItem {
  id: string; // This will be the name of the product
  quantity: number;
  weight: string;
}

export default function InventoryPage() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchPantryItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'pantryItems'));
      const items: PantryItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ 
          id: doc.id, 
          quantity: doc.data().quantity,
          weight : doc.data().weight || 'g'
        });
      });
      setPantryItems(items);
    };

    fetchPantryItems();
  }, []);

  const filteredItems = pantryItems.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = () => {
    const doc = new jsPDF();
    
    doc.text('Inventory Report', 14, 15);
    
    const tableColumn = ["Product Name", "Quantity", "Weight"];
    const tableRows = filteredItems.map(item => [item.id, item.quantity,item.weight]);

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

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleDownload}>Download PDF</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Weight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}