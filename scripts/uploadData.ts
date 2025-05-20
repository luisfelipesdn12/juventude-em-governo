import * as data from '../seed.json';
import { db } from '../src/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

async function uploadData() {
  try {
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
        name: card.name,
        price: card.price,
        reward: card.reward,
      });
    }
    console.log('Open government cards uploaded successfully');

    console.log('All data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading data:', error);
    process.exit(1);
  }
}

uploadData();
