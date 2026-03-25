import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendReplyEmail(to: string, subject: string, originalMessage: string, reply: string, name: string) {
    console.log('📧 [SIMULATION] Email envoyé à:', to);
    console.log('   Sujet:', subject);
    console.log('   Réponse:', reply);
    console.log('   ✅ Simulation - email non envoyé réellement');
    return true;
  }
}