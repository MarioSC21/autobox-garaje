import test from 'node:test';
import assert from 'node:assert/strict';
import {paymentTotal} from '../dist/core.js';
test('no registra como pago un total de cero, incluso por tolerancia o descuento completo',()=>{
 assert.throws(()=>paymentTotal(0,0,'paid'),/mayor que cero/);
 assert.throws(()=>paymentTotal(5,5,'paid'),/mayor que cero/);
 assert.throws(()=>paymentTotal(5,4.999,'paid'),/mayor que cero/);
 assert.equal(paymentTotal(5,4.99,'paid'),0.01);
 assert.equal(paymentTotal(10,2.5,'paid'),7.5);
});
test('permite cerrar sin pago en cero y rechaza importes y estados inválidos',()=>{
 assert.equal(paymentTotal(0,0,'unpaid'),0);
 assert.equal(paymentTotal(5,5,'unpaid'),0);
 assert.equal(paymentTotal(5,0,'unpaid'),5);
 for(const args of [[5,6,'paid'],[-1,0,'paid'],[5,-1,'paid'],[NaN,0,'paid'],[5,Infinity,'paid'],[5,0,'unknown']])assert.throws(()=>paymentTotal(...args));
});
