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
        'https://media.giphy.com/media/psNbEEYu2wqC4/giphy.gif',
        'https://media.giphy.com/media/x33p3SDzDM1ji/giphy.gif',
        'https://media.tenor.com/images/6299dd92d2cdd27ef5109915736f562b/tenor.gif',
        'https://media0.giphy.com/media/j1QQj6To9Pbxu/giphy.gif?cid=3640f6095c1b8d405542324563bce467',
        'https://media1.tenor.com/images/21feb0104626e77b01544ec9e2998c0e/tenor.gif?itemid=3580665',
        'https://media1.tenor.com/images/727cf3a6ec2e9a337248926db3c93cce/tenor.gif?itemid=7317444',
        'https://media1.tenor.com/images/7355b9adf82b717e2af222303438b204/tenor.gif?itemid=7322073',
        'https://media2.giphy.com/media/HGETmieaLgcxy/giphy.gif?cid=3640f6095c1b9bcd6f4a757167497f51',
        'https://media3.giphy.com/media/p1hRAmsUMaSmA/giphy.gif?cid=3640f6095c1b96d23262756f45616981',
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
    const seconds = this.state.timeSeconds.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    })

    return `${this.state.timeMinutes}:${seconds}`
  }

  scanLink () {
    return `ark:${this.state.recipient}?amount=${this.state.amountCrypto}&vendorField=${this.state.vendorField}`
  }

  changeMethod (value) {
    this.state.method = value
  }

  copyToClipboard (prop) {
    console.log(this.state[prop])
  }

  render() {
    let addressClassName = 'tab p-3 text-sm rounded-tl rounded-bl'
    addressClassName += this.state.method === 'address' ? ' blue' : 'grey'

    let qrcodeClassName = 'tab p-3 text-sm rounded-tr rounded-br'
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
                            <div className="w-3/4 flex-none">
                                <small className="block mb-2">Time to pay:</small>
                                <img src="images/time.png" className="time inline-block" />
                                <span className="inline-block pl-3">
                                    <span className="font-bold block">{this.countdownLabel()}</span>
                                    <span><span className="waiting text-sm font-light">Waiting for transaction confirmation ...</span></span>
                                </span>
                            </div>
                            <div className="w-1/4 flex-none pt-6">
                                <a href={this.scanLink()} className="pay-button text-sm font-bold p-3 no-underline rounded float-right">Pay Now</a>
                            </div>
                        </div>
                    </div>}
            </div>
        </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
