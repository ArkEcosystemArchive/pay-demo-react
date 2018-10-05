<template>
        <div class="font-sans text-base container mx-auto mt-10">
            <div class="max-w-sm rounded-lg overflow-hidden shadow mx-auto bg-white">
                <div class="p-6 pb-0">
                    <p class="text-grey-darker text-base">
                        <!-- <a href="#" class="close float-right"><i class="fa fa-times"></i></a> -->

                        <div class="mb-6 buttons flex">
                            <button
                                @click="changeMethod('address')"
                                :class="{ blue: method === 'address', grey: method === 'qrcode' }"
                                class="p-3 text-sm rounded-tl rounded-bl">Address</button>

                            <button
                                @click="changeMethod('qrcode')"
                                :class="{ blue: method === 'qrcode', grey: method === 'address' }"
                                class="p-3 text-sm rounded-tr rounded-br">QR-Code</button>
                        </div>

                        <div v-if="method === 'address'">
                            <div class="mt-3 pb-3 border-b-2 border-dashed">
                                <small class="block mb-2">Product</small>
                                <span class="font-bold">
                                    Surprise GIF
                                </span>
                            </div>

                            <div class="mt-3 pb-3 border-b-2 border-dashed">
                                <small class="block mb-2">ARK Address</small>
                                <span class="font-bold">
                                    {{ recipient }}
                                    <a href="#" class="clipboard float-right"><img v-clipboard="recipient" src="images/clipboard.png"></a>
                                </span>
                            </div>

                            <div class="mt-3 pb-3 border-b-2 border-dashed">
                                <small class="block mb-2">Vendor Field</small>
                                <span class="font-bold">
                                    {{ vendorField }}
                                    <a href="#" class="clipboard float-right"><img v-clipboard="vendorField" src="images/clipboard.png"></a>
                                </span>
                            </div>

                            <div class="mt-3 pb-3 border-b-2 border-dashed" v-if="amountCrypto">
                                <small class="block mb-2">Amount</small>
                                <span class="font-bold block pt-1">
                                    <span class="currency font-hairline rounded text-sm mr-2 px-2 py-1">DѦ</span>
                                    {{ amountCrypto }}
                                    <span class="fiat font-normal">/ ${{ amount }}</span>
                                    <a href="#" class="clipboard float-right"><img v-clipboard="amountCrypto" src="images/clipboard.png"></a>
                                </span>
                            </div>
                        </div>

                        <div v-if="method === 'qrcode'" class="text-center">
                            <a :href="scanLink">
                                <qrcode :value="scanLink" :options="{ size: 256, padding: 0 }"></qrcode>
                            </a>
                        </div>
                    </p>
                </div>

                <div class="p-6" v-if="!hasPaid">
                    <div class="flex flex-no-wrap">
                        <div class="w-16 flex-none">
                            <img src="images/time.png" class="time">
                        </div>
                        <div class="w-4/5 flex-none">
                            <small class="block mb-2">Time to pay:</small>
                            <span class="font-bold">{{ countdownLabel }} <span class="waiting text-sm font-light">Waiting for transaction confirmation ...</span></span>
                        </div>
                    </div>
                </div>

                <div class="p-6" v-if="hasPaid">
                    <img :src="product" />
                </div>
            </div>
        </div>
</template>

<script>
    import ArkPay from '@arkecosystem/pay'
    import { sample } from 'lodash'
    import uuid from 'uuid/v1'

    export default {
        data() {
            return {
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
        },
        computed: {
            countdownLabel: function () {
                return `${this.timeMinutes}:${this.timeSeconds}`
            },
            scanLink: function () {
                return `ark:${this.recipient}?amount=${this.amountCrypto}&vendor=${this.vendorField}`
            }
        },
        mounted() {
            this.setup()
        },
        methods: {
            async setup () {
                const gateway = new ArkPay()
                gateway
                    .recipient(this.recipient)
                    .amount(this.amount)
                    .vendorField(this.vendorField)
                    .currency('USD')
                    .coin('ARK')
                    .network('devnet')

                gateway.on('started', data => {
                    this.amountCrypto = data.transfer.amounts.crypto
                })

                gateway.on('completed', data => {
                    this.hasPaid = true
                    this.product = sample(this.products)
                })

                await gateway.prepare()
                await gateway.start()

                this.countdown()
            },
            countdown() {
                this.timeLeft = this.intervalMinutes * 60

                const calculate = () => {
                  if (this.hasPaid) {
                    clearInterval(this.waitingTimer)

                    return
                  }

                  if (this.timeLeft <= 0) {
                    clearInterval(this.waitingTimer)

                    alert('We have not received any payment so far. Try again.')

                    window.location.reload()

                    return
                  }

                  this.timeLeft -= 1
                  this.timeMinutes = Math.floor(this.timeLeft / 60)
                  this.timeSeconds = this.timeLeft - this.timeMinutes * 60
                }

                this.waitingTimer = setInterval(calculate.bind(this), 1000)
            },
            changeMethod(method) {
                this.method = method
            }
        }
    }
</script>
