import { Injectable } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { envConfig } from 'src/shared/config'
import { escapeMarkdownV2 } from 'src/shared/helpers'

@Injectable()
export class TelegramService {
  private bot: TelegramBot

  constructor() {
    this.bot = new TelegramBot(envConfig.TELEGRAM_TOKEN_BOT, {
      polling: true
    })
  }

  sendMessageBuySuccess({
    email,
    titleCourse,
    totalPrice
  }: {
    email: string
    titleCourse: string
    totalPrice: string
  }) {
    const totalPriceFormat = Number(totalPrice).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    })
    const message = [
      '🔔 *Thông báo đơn hàng mới*',
      `👤 *Email:* ${escapeMarkdownV2(email)}`,
      `🎓 *Khóa học:* ${escapeMarkdownV2(titleCourse)}`,
      `💰 *Tổng tiền:* ${escapeMarkdownV2(totalPriceFormat)}`,
      `🕐 *Thời gian:* ${escapeMarkdownV2(new Date().toLocaleString('vi-VN'))}`
    ].join('\n')
    return this.bot.sendMessage(envConfig.TELEGRAM_YOUR_ID, message, {
      parse_mode: 'MarkdownV2'
    })
  }
}
