import { db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface PageSection {
  id: string;
  component: string;
  title: string;
  visible: boolean;
  backgroundColor: string;
  props: Record<string, any>;
}

export async function getPageLayout(pageId: string): Promise<PageSection[]> {
  try {
    const docRef = doc(db, 'page_layouts', pageId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().sections || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching page layout:', error);
    return [];
  }
}

export async function savePageLayout(pageId: string, sections: PageSection[]): Promise<void> {
  try {
    const docRef = doc(db, 'page_layouts', pageId);
    await setDoc(docRef, { sections }, { merge: true });
  } catch (error) {
    console.error('Error saving page layout:', error);
    throw error;
  }
}
