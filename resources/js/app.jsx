import React from 'react'
import ReactDOM from 'react-dom'

import QRCode from 'qrcode'
import ArkPay from '@arkecosystem/pay'
import { sample } from 'lodash'
import uuid from 'uuid/v1'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      method: 'address',
      hasPaid: false,
      recipient: 'DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9',
      amount: 1,
      amountCrypto: null,
      vendorField: uuid(),
      product: null,
      products: [
        'https://media1.tenor.com/images/3e6e34d6cb50d6a9555076d70d5b608c/tenor.gif?itemid=6041827',
        'https://orig00.deviantart.net/9edf/f/2015/238/3/a/make_it_rain_llama_by_snowbacon-d97b1z8.gif',
        'https://thumbs.gfycat.com/IncredibleInfantileCottonmouth-size_restricted.gif',
        'https://i.imgur.com/Maj5zM2.gif',
        'https://media.giphy.com/media/94EQmVHkveNck/giphy.gif'
      ],
      timeLeft: 0,
      timeMinutes: 0,
      timeSeconds: 0,
      intervalMinutes: 5,
      waitingTimer: null,
    }
  }

  async componentDidMount() {
    await this.setup()
  }

  componentWillUnmount() {
    clearInterval(this.waitingTimer)
  }

  async setup () {
    const gateway = new ArkPay()
    gateway
      .recipient(this.state.recipient)
      .amount(this.state.amount)
      .vendorField(this.state.vendorField)
      .currency('USD')
      .coin('ARK')
      .network('devnet')

    gateway.on('started', data => {
        this.state.amountCrypto = data.transfer.amounts.crypto
    })

    gateway.on('completed', data => {
        this.state.hasPaid = true
        this.state.product = sample(this.state.products)
    })

    await gateway.prepare()
    await gateway.start()

    await this.generateQRCode()
    this.countdown()
  }

  async generateQRCode() {
    try {
      this.qrcode = await QRCode.toDataURL(this.scanLink())
    } catch (err) {
      console.error(err)
    }
  }

  countdown() {
    this.state.timeLeft = this.state.intervalMinutes * 60

    const calculate = () => {
      if (this.state.hasPaid) {
        clearInterval(this.waitingTimer)

        return
      }

      if (this.state.timeLeft <= 0) {
        clearInterval(this.waitingTimer)

        alert('We have not received any payment so far. Try again.')

        window.location.reload()

        return
      }

      this.setState(state => ({
        timeLeft: state.timeLeft - 1,
        timeMinutes: Math.floor(this.state.timeLeft / 60),
        timeSeconds: this.state.timeLeft - this.state.timeMinutes * 60
      }))
    }

    this.waitingTimer = setInterval(calculate.bind(this), 1000)
  }

  countdownLabel () {
    return `${this.state.timeMinutes}:${this.state.timeSeconds}`
  }

  scanLink () {
    return `ark:${this.state.recipient}?amount=${this.state.amountCrypto}&vendor=${this.state.vendorField}`
  }

  changeMethod (value) {
    this.state.method = value
  }

  copyToClipboard (prop) {
    console.log(this.state[prop])
  }

  render() {
    let addressClassName = 'p-3 text-sm rounded-tl rounded-bl'
    addressClassName += this.state.method === 'address' ? ' blue' : 'grey'

    let qrcodeClassName = 'p-3 text-sm rounded-tr rounded-br'
    qrcodeClassName += this.state.method === 'qrcode' ? ' blue' : 'grey'

    return (
        <div className="font-sans text-base container mx-auto mt-10">
            <div className="max-w-sm rounded-lg overflow-hidden shadow mx-auto bg-white">
                <div className="p-6 pb-0">
                    <div className="text-grey-darker text-base">
                        <div className="mb-6 buttons flex">
                            <button
                                onClick={this.changeMethod.bind(this, 'address')}
                                className={addressClassName}>Address</button>

                            <button
                                onClick={this.changeMethod.bind(this, 'qrcode')}
                                className={qrcodeClassName}>QR-Code</button>
                        </div>

                        {this.state.method === 'address' ? <div>
                            <div className="mt-3 pb-3 border-b-2 border-dashed">
                                <small className="block mb-2">Product</small>
                                <span className="font-bold">
                                    Surprise GIF
                                </span>
                            </div>

                            <div className="mt-3 pb-3 border-b-2 border-dashed">
                                <small className="block mb-2">ARK Address</small>
                                <span className="font-bold">
                                    {this.state.recipient}
                                    <a href="#" className="clipboard float-right"><img onClick={this.copyToClipboard.bind(this, 'recipient')} src="images/clipboard.png" /></a>
                                </span>
                            </div>

                            <div className="mt-3 pb-3 border-b-2 border-dashed">
                                <small className="block mb-2">Vendor Field</small>
                                <span className="font-bold">
                                    {this.state.vendorField}
                                    <a href="#" className="clipboard float-right"><img onClick={this.copyToClipboard.bind(this, 'vendorField')} src="images/clipboard.png" /></a>
                                </span>
                            </div>

                            <div className="mt-3 pb-3 border-b-2 border-dashed">
                                <small className="block mb-2">Amount</small>
                                <span className="font-bold block pt-1">
                                    <span className="currency font-hairline rounded text-sm mr-2 px-2 py-1">DѦ</span>
                                    {this.state.amountCrypto}
                                    <span className="fiat font-normal">/ ${this.state.amount}</span>
                                    <a href="#" className="clipboard float-right"><img onClick={this.copyToClipboard.bind(this, 'amountCrypto')} src="images/clipboard.png" /></a>
                                </span>
                            </div>
                        </div>
                      :
                        <div className="text-center">
                            <a href={this.scanLink()}>
                              <img src={this.qrcode} />
                            </a>
                        </div>}
                    </div>
                </div>

                {this.state.hasPaid
                  ?
                    <div className="p-6">
                        <img src={this.state.product} />
                    </div>
                  :
                    <div className="p-6">
                        <div className="flex flex-no-wrap">
                            <div className="w-16 flex-none">
                                <img src="images/time.png" className="time" />
                            </div>
                            <div className="w-4/5 flex-none">
                                <small className="block mb-2">Time to pay:</small>
                                <span className="font-bold">{this.countdownLabel} <span className="waiting text-sm font-light">Waiting for transaction confirmation ...</span></span>
                            </div>
                        </div>
                    </div>}
            </div>
        </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
