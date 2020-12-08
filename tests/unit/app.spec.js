import { mount } from '@vue/test-utils'
import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'
import App from './../../src/App.vue'

Vue.prototype.$http = axios
Vue.prototype.moment = moment

describe('App', () => {
    it('has data', () => {
        expect(typeof App.data).toBe('function')
    })
})

describe('Mounted App', () => {
    const wrapper = mount(App);

    it('has instructions text', () => {
        expect(wrapper.html()).toContain('Please select a route, stop, and direction to view the next estimated departure.')
    })

    it('has initial empty data', () => {
        expect(wrapper.vm.routes.length).toBe(0)
        expect(wrapper.vm.stops.length).toBe(0)
        expect(wrapper.vm.predictions.length).toBe(0)
        expect(wrapper.vm.error).toBe(null)
        expect(wrapper.vm.selected.route).toBe(null)
        expect(wrapper.vm.selected.stop).toBe(null)
        expect(wrapper.vm.selected.direction).toBe(null)
    })

    describe('getRoutes', () => {
        it('loads route data from API', async () => {
            await wrapper.vm.getRoutes()
            expect(wrapper.vm.routes.length).not.toBe(0)
        })
    })

    describe('getStops', () => {
        it('loads stop data from API', async () => {
            await wrapper.vm.getRoutes()
            wrapper.vm.selected.route = wrapper.vm.routes[0]
            await wrapper.vm.getStops()
            expect(wrapper.vm.stops.length).not.toBe(0)
        })
    })

    describe('getPrediction', () => {
        it('loads prediction data from API', async () => {
            await wrapper.vm.getRoutes()
            wrapper.vm.selected.route = wrapper.vm.routes[0]
            await wrapper.vm.getStops()
            wrapper.vm.selected.stop = wrapper.vm.stops[0]
            wrapper.vm.selected.direction = 0
            await wrapper.vm.getPrediction()
            expect(wrapper.vm.predictions.length).not.toBe(0)
        })
    })

    describe('selectStop', () => {
        it('clears direction selection and prediction data when new stop selected', async () => {
            await wrapper.vm.getRoutes()
            wrapper.vm.selected.route = wrapper.vm.routes[0]
            await wrapper.vm.getStops()
            wrapper.vm.selected.stop = wrapper.vm.stops[0]
            wrapper.vm.selected.direction = 0
            await wrapper.vm.getPrediction()
            expect(wrapper.vm.predictions.length).not.toBe(0)
            expect(wrapper.vm.selected.direction).toBe(0)
            wrapper.vm.selected.stop = wrapper.vm.stops[1]
            wrapper.vm.selectStop()
            expect(wrapper.vm.predictions.length).toBe(0)
            expect(wrapper.vm.selected.direction).toBe(null)
        })
    })
})
