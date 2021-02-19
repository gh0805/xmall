import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import { setStore, getStore } from '@/utils/storage'

export default new Vuex.Store({
  state: {
	  login: false, //是否登录
	  userInfo: null,  //用户信息
	  cartList: [],  //加入购物车商品
	  showCart: false  
  },
  mutations: {
	  // 网页初始化时从本地缓存获取购物车数据
	  INITBUYCART(state){
		  let initCart = getStore('buyCart');
		  if(initCart) {
			  state.cartList = JSON.parse(initCart)
		  }
	  },
	  SHOWCART(state, {showCart}){
		  state.showCart = showCart
	  },
	  ISLOGIN(state, info) {
		  state.userInfo = info;
		  state.login = true;
		  setStore('userInfo', info)
	  },
	  ADDCART(state, {productId, salePrice, productName, productImageBig, productNum=1}) {
		  let cart = state.cartList;
		  // console.log(cart)
		  let goods = {
			  productId,
			  salePrice,
			  productName,
			  productImageBig
		  };
		  let falg = true;
		  if(cart.length){
			  cart.forEach(item => {
				  if(item.productId === productId) {
					  if(item.productNum >= 0){
						  falg = false;
						  item.productNum += productNum;
					  }
				  }
			  })
		  }
		  if(!cart.length ||falg){
			  goods.productNum = productNum;
			  cart.push(goods);
		  }
		  state.cartList = cart;
		  setStore('buyCart', cart);
	  },
	  DELETECART(state, {index, type}){
		  let cart = state.cartList
		  if(type === 0){
			  cart.splice(index, 1)
			  console.log(cart)
		  }else if(type === 1){
			  var i = cart.length
			  while(i--) {
				  if(index.indexOf(i) > -1){
					  cart.splice(i, 1)
				  }
			  }
		  }
		  console.log(cart)
		  state.cartList = cart
		  setStore('buyCart', cart);
	  },
	  CHANGEPRODUCT(state, {index, number}){
		  let cart = state.cartList
		  console.log(number)
		  cart[index].productNum = number;
		  // console.log(number)
		  state.cartList = cart
		  setStore('buyCart', cart)
		  console.log(cart)
	  }
  },
  actions: {
  },
  modules: {
  }
})
