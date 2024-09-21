'use client'
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, Firestore, query, where } from "firebase/firestore";
import firebaseConfig from "@/app/firebase/config";
import { initializeApp } from 'firebase/app';
import { useUser } from "@clerk/nextjs";
import { suggestRecipe } from '../pages/api/suggestRecipe';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

const RecipeSuggestions: React.FC = () => {
  const { user } = useUser();
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasGeneratedRecipe, setHasGeneratedRecipe] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchPantryItems();
    }
  }, [user]);

  const fetchPantryItems = async () => {
    if (!user) return;
    const q = query(collection(db, 'pantryItems'), where("userId", "==", user.id));
    const querySnapshot = await getDocs(q);
    const items: string[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data().name);
    });
    setPantryItems(items);
    setLoading(false);
  };

  const generateRecipe = async () => {
    setLoading(true);
    await fetchRecipe(pantryItems);
    setHasGeneratedRecipe(true);
  };

  const fetchRecipe = async (ingredients: string[]) => {
    try {
      const suggestion = await suggestRecipe(ingredients);
      // Parse the HTML string into a DOM object
      const parser = new DOMParser();
      const doc = parser.parseFromString(suggestion, 'text/html');
      
      // Extract information from the parsed DOM
      const recipeData = {
        title: doc.querySelector('.recipe-title')?.textContent || '',
        difficulty: doc.querySelector('.recipe-difficulty')?.textContent || '',
        prepTime: doc.querySelector('.recipe-time:nth-of-type(1)')?.textContent || '',
        cookTime: doc.querySelector('.recipe-time:nth-of-type(2)')?.textContent || '',
        servings: doc.querySelector('.recipe-servings')?.textContent || '',
        ingredients: Array.from(doc.querySelectorAll('.recipe-ingredients li')).map(li => li.textContent),
        instructions: Array.from(doc.querySelectorAll('.recipe-instructions li')).map(li => li.textContent),
        notes: doc.querySelector('.recipe-notes p')?.textContent || '',
      };
      
      setRecipe(recipeData);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please sign in to view recipe suggestions.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-green-950">Recipe Suggestion</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasGeneratedRecipe && (
            <div className="text-center mb-4">
              <Button onClick={generateRecipe} disabled={loading} className="bg-green-500 text-white hover:bg-green-100">
                {loading ? 'Generating...' : 'Generate Recipe'}
              </Button>
            </div>
          )}
          {loading ? (
            <p className="text-center">Loading recipe suggestion...</p>
          ) : recipe ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-center mb-4">{recipe.title}</h2>
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="secondary">{recipe.difficulty}</Badge>
                <Badge variant="secondary"><Clock className="w-4 h-4 inline mr-1" />{recipe.cookTime}</Badge>
                <Badge variant="secondary"><Users className="w-4 h-4 inline mr-1" />{recipe.servings}</Badge>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                  {recipe.ingredients.map((ingredient: string, index: number) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Instructions</h3>
                <ol className="list-decimal pl-5 mb-4 space-y-2">
                  {recipe.instructions.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
              
              {recipe.notes && (
                <div>
                  <Separator className="my-4" />
                  <h3 className="text-xl font-semibold mb-2">Chef's Notes</h3>
                  <p className="italic text-gray-600">{recipe.notes}</p>
                </div>
              )}
            </div>
          ) : hasGeneratedRecipe ? (
            <p className="text-center text-red-500">Failed to fetch recipe suggestion.</p>
          ) : (
            <p className="text-center">Click the button above to generate a recipe suggestion.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeSuggestions;