import { Listener, container } from '@sapphire/framework';
import qrc from 'qrcode-terminal';

export class WhatsappQRListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.whatsapp,
            event: 'qr',
            name: 'whatsappQr'
        });
    }
    run(qr) {
        qrc.generate(qr, { small: true }, (qrcode) => {
            this.container.logger.info('Login QR code for WhatsApp client:');
            this.container.logger.info(qrcode);
        });
    }
}