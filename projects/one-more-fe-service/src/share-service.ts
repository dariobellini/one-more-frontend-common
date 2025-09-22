import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  async shareContent(title: string, text: string, url?: string) {
    const canShare = !!(navigator as any).share;

    if (canShare) {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Condividi con i tuoi amici',
      });
    } else {
      // Fallback: copia link negli appunti
      if (url) {
        await navigator.clipboard.writeText(url);
        alert('Link copiato negli appunti!');
      } else {
        alert('La condivisione non è supportata su questo browser.');
      }
    }
  }
}
