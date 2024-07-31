'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, getDocs, updateDoc, deleteDoc, doc, Firestore } from "firebase/firestore";
import firebaseConfig from "@/app/firebase/config";

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

interface PantryItem {
  name: string;
  quantity: number;
  weight: string;
}

const weightOptions = [
  { value: 'g', label: 'Grams' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'oz', label: 'Ounces' },
  { value: 'lb', label: 'Pounds' },
];

export default function Pantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState<PantryItem>({ name: '', quantity: 1, weight: 'g' });
  const [isEditing, setIsEditing] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (): Promise<void> => {
    const querySnapshot = await getDocs(collection(db, "pantryItems"));
    const fetchedItems: PantryItem[] = querySnapshot.docs.map(doc => ({ 
      name: doc.id, 
      quantity: doc.data().quantity,
      weight: doc.data().weight || 'g' // Default to grams if not set
    }));
    setItems(fetchedItems);
  };

  const addOrUpdateItem = async (): Promise<void> => {
    if (newItem.name.trim() === '') return;

    await setDoc(doc(db, "pantryItems", newItem.name.trim()), { 
      quantity: newItem.quantity,
      weight: newItem.weight
    }, { merge: true });

    setNewItem({ name: '', quantity: 1, weight: 'g' });
    setIsAlertOpen(false);
    fetchItems();
  };

  const updateItemQuantity = async (name: string, newQuantity: number): Promise<void> => {
    if (newQuantity <= 0) {
      await deleteDoc(doc(db, "pantryItems", name));
    } else {
      await updateDoc(doc(db, "pantryItems", name), { quantity: newQuantity });
    }
    fetchItems();
  };

  const deleteItem = async (name: string): Promise<void> => {
    await deleteDoc(doc(db, "pantryItems", name));
    fetchItems();
  };

  const openEditDialog = (item: PantryItem) => {
    setNewItem(item);
    setIsEditing(true);
    setIsAlertOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pantry Management</h1>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button onClick={() => {
            setNewItem({ name: '', quantity: 1, weight: 'g' });
            setIsEditing(false);
            setIsAlertOpen(true);
          }}>
            Add New Item
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the details of the pantry item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Item name"
              disabled={isEditing}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Math.max(1, parseInt(e.target.value)) })}
                placeholder="Quantity"
                min="1"
              />
              <Select
                value={newItem.weight}
                onValueChange={(value) => setNewItem({ ...newItem, weight: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select weight unit" />
                </SelectTrigger>
                <SelectContent>
                  {weightOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={addOrUpdateItem}>
              {isEditing ? 'Update' : 'Add'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Item Name</TableHead>
            <TableHead className="w-1/4">Quantity</TableHead>
            <TableHead className="w-1/4">Weight Unit</TableHead>
            <TableHead className="w-1/4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.name}>
              <TableCell className="w-1/4">{item.name}</TableCell>
              <TableCell className="w-1/4">{item.quantity}</TableCell>
              <TableCell className="w-1/4">{item.weight}</TableCell>
              <TableCell className="w-1/4 text-right">
                <div className="flex justify-end space-x-2">
                  <Button onClick={() => updateItemQuantity(item.name, item.quantity + 1)} size="sm">+</Button>
                  <Button onClick={() => updateItemQuantity(item.name, item.quantity - 1)} size="sm">-</Button>
                  <Button onClick={() => openEditDialog(item)} size="sm">Edit</Button>
                  <Button onClick={() => deleteItem(item.name)} variant="destructive" size="sm">Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}