import * as data from '../seed.json';
import { db } from '../src/lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

async function clearCollection(collectionName: string) {
  console.log(`Clearing collection: ${collectionName}`);
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  console.log(`Cleared ${snapshot.docs.length} documents from ${collectionName}`);
}

async function clearNestedCollection(parentCollection: string, parentId: string, nestedCollection: string) {
  console.log(`Clearing nested collection: ${parentCollection}/${parentId}/${nestedCollection}`);
  const nestedRef = collection(db, `${parentCollection}/${parentId}/${nestedCollection}`);
  const snapshot = await getDocs(nestedRef);
  
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  console.log(`Cleared ${snapshot.docs.length} documents from ${parentCollection}/${parentId}/${nestedCollection}`);
}

async function uploadData() {
  try {
    // Check if we should truncate collections first
    if (process.env.TRUNCATE_FIRST === 'true') {
      console.log('TRUNCATE_FIRST is enabled. Clearing all collections...');
      
      // Clear main collections
      await clearCollection('categories');
      await clearCollection('items');
      await clearCollection('rooms');
      await clearCollection('open_government_cards');
      await clearCollection('advantages_and_unforeseen_cards');
      
      // Clear nested card collections for each category
      for (const category of data.categories) {
        await clearNestedCollection('categories', category.id, 'cards');
      }
      
      console.log('All collections cleared successfully!');
    }

    // Upload categories
    const categoriesRef = collection(db, 'categories');
    for (const category of data.categories) {
      await setDoc(doc(categoriesRef, category.id), {
        name: category.name,
      });

      // Upload cards for each category
      const cardsRef = collection(db, `categories/${category.id}/cards`);
      for (const card of category.cards) {
        await setDoc(doc(cardsRef, card.id), {
          metrics: card.metrics,
        });
      }
    }
    console.log('Categories and cards uploaded successfully');

    // Upload items
    const itemsRef = collection(db, 'items');
    for (const item of data.items) {
      await setDoc(doc(itemsRef, item.id), {
        name: item.name,
        price: item.price,
        category_id: item.category_id,
        metrics: item.metrics,
      });
    }
    console.log('Items uploaded successfully');

    // Upload rooms
    const roomsRef = collection(db, 'rooms');
    for (const room of data.rooms) {
      await setDoc(doc(roomsRef, room.id), {
        cities: room.cities,
        settings: room.settings,
      });
    }
    console.log('Rooms uploaded successfully');

    // Upload open government cards
    const openGovCardsRef = collection(db, 'open_government_cards');
    for (const card of data.open_government_cards) {
      await setDoc(doc(openGovCardsRef, card.id.toString()), {
        category: card.category,
        text: card.text,
        price: card.price,
        reward: card.reward,
      });
    }
    console.log('Open government cards uploaded successfully');

    // Upload advantages and unforeseen cards
    const advantagesUnforeseenRef = collection(db, 'advantages_and_unforeseen_cards');
    for (const card of data.advantages_and_unforeseen_cards) {
      await setDoc(doc(advantagesUnforeseenRef, card.id), {
        type: card.type,
        text: card.text,
        effect: card.effect,
        category_id: card.category_id,
        points: card.points,
      });
    }
    console.log('Advantages and unforeseen cards uploaded successfully');

    console.log('All data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading data:', error);
    process.exit(1);
  }
}

uploadData();
