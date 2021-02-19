const express = require('express')
const app = express()
const path = require('path');
const fs = require('fs');
var history = require('connect-history-api-fallback');

// @param {*当前页的数量} pageSize
// @param {*当前页} currentPage
// @param {*当前数组} arr
function pagination(pageSize, currentPage, arr) {
    let skipNum = (currentPage - 1) * pageSize;
    let newArr = (skipNum + pageSize >= arr.length) ? arr.slice(skipNum, arr.length) : arr.slice(skipNum, skipNum + pageSize);
    return newArr;
}

// 升序还是降序
/**
 * 
 * @param {*排序的属性} attr
 * @param {*true表示升序排序 false表示降序排序} rev  
 */
function sortBy (attr, rev) {
	if (rev === undefined) {
		rev = 1;
	} else {
		rev = rev ? 1 : -1;
	}
	return function (a, b) {
		a = a[attr];
		b = b[attr];
		if (a < b) {
			return rev * -1;
		}
		if (a > b) {
			return rev * 1;
		}
		return 0;
	}
}

function range(arr, gt, lte) {
    return arr.filter(item => item.salePrice >= gt && item.salePrice <= lte)
}

const cors = require('cors');  //跨域中间件
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');  //post请求中间件
const cartListJSON = require('./db/cartList.json')
app.use(history());
app.use(express.static(path.join(__dirname, '../dist')));
app.use(cors());  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.get('/api/goods/home', (req, res)=>{
	fs.readFile('./db/home.json', 'utf8', (err, data)=>{
		if(!err){
			res.json(JSON.parse(data))   //获取的是字节流，所以需要JSON解析
		}
	})
})
app.get('/api/goods/allGoods', (req, res) => {
	// 获取的是前端地址栏上的查询参数
	const page = parseInt(req.query.page);
	const size = parseInt(req.query.size);
	const sort = parseInt(req.query.sort);
	const gt = parseInt(req.query.priceGt);
	const lte = parseInt(req.query.priceLte);
	const cid = req.query.cid;
	let newData = []
	fs.readFile('./db/allGoods.json', 'utf8', (err, data) => {
		let { result } = JSON.parse(data);
		// let result = JSON.parse(data);
		console.log(typeof(result));
		let allData = result.data;
		// 分页显示
		newData = pagination(size, page, allData);
		if (cid === '1184') { //品牌周边
			newData = allData.filter((item) => item.productName.match(RegExp(/Smartisan/)))
			if (sort === 1) { //价格由低到高
				newData = newData.sort(sortBy('salePrice', true))
			} else if (sort === -1) { //价格由高到低
				newData = newData.sort(sortBy('salePrice', false))
			}
		} else {
			if (sort === 1) { //价格由低到高
				newData = newData.sort(sortBy('salePrice', true))
			} else if (sort === -1) { //价格由高到低
				newData = newData.sort(sortBy('salePrice', false))
			}
			if (gt && lte) {
				// 过滤 10~1000
				newData = range(newData, gt, lte)
			}
			// 32 

		}
		if (newData.length < size) {
			res.json({
				data: newData,
				total: newData.length
			})
		} else {
			res.json({
				data: newData,
				total: allData.length
			})
		}
	})
})
app.get('/api/goods/productDet', (req, res) => {
	const productId = req.query.productId;
	// console.log(productId);
	fs.readFile('./db/goodsDetail.json', 'utf8', (err, data) => {
		if (!err) {
			let { result } = JSON.parse(data);  //JSON.parse() 将json字符串转化为对象
			// console.log(typeof(result));  // result是数组
			// console.log(result);  没有问题，正常
			let newData = result.find(item => item.productId == productId)
			// console.log(newData) 只有首页的数据可以查看详情
			res.json(newData)
		}
	})
})

// 模拟一个登录接口
app.post('/api/login', (req, res) => {
	console.log('登录名：')
	console.log(req.body.user);
	// 登录成功获取用户名
	let username = req.body.user
	// 一系列的操作
	res.json({
		// 进行加密的方法
		// sign 参数一：加密对象  参数二：加密规则  参数三：对象
		token: jwt.sign({ username: username }, 'abcd', {
			// 过期时间
			expiresIn: "3000s"
		}),
		username,
		state: 1,
		file: '/static/images/1570600179870.png',
		code: 200,
		address: null,
		balance: null,
		description: null,
		email: null,
		message: null,
		phone: null,
		points: null,
		sex: null,
		id: 62
	})
})
// 登录持久化验证接口 访问这个接口的时候 一定要访问token（前端页面每切换一次就访问一下这个接口，问一下我有没有登录/登录过期）
// 先访问登录接口 得到token 再访问这个，看是否成功
app.post('/api/validate', function(req, res) {
	let token = req.headers.authorization;
	console.log('token:')
	console.log(token);
	
	// 验证token合法性 对token进行解码
	jwt.verify(token, 'abcd', function(err, decode) {
		if(err) {
			// console.log(err)
			res.json({
				msg: '当前用户未登录'
			})
		}else {
			// 证明用户已经登录
			res.json({
				token: jwt.sign({ username: decode.username }, 'abcd', {
					// 过期时间
					expiresIn: "3000s"
				}),
				username: decode.username,
				msg: '已登录',
				address: null,
				balance: null,
				description: null,
				email: null,
				file: "/static/images/1570600179870.png",
				id: 62,
				message: null,
				phone: null,
				points: null,
				sex: null,
				state: 1
			})
		}
	})
})
app.post('/api/addCart', (req, res) => {
	let { userId, productId, productNum } = req.body;
	// console.log(userId)
	// console.log(productId)
	// console.log(productNum)
	fs.readFile('./db/allGoods.json', (err, data) => {
		let { result } = JSON.parse(data);
		// console.log('result:')
		// console.log(result)
		if(productId && userId) {
			let  { cartList } = cartListJSON.result.find(item => item.id == userId)
			// 找到对应的商品
			let newData = result.data.find(item => item.productId == productId)
			newData.limitNum = 100;
			newData.isSelected = false;
			let falg = true;
			if (cartList && cartList.length) {
				cartList.forEach(item => {
					if(item.productId == productId) {
						if(item.productNum >= 1) {
							falg = false;
							item.productNum += parseInt(productNum)
						}
					}
				})
			}
			if(!cartList.length || falg) { //购物车为空
				newData.productNum = parseInt(productNum)
				cartList.push(newData)
			}
			
			// 序列化
			fs.writeFile('./db/cartList.json', JSON.stringify(cartListJSON), (err) => {
				if (!err) {
					res.json({
						code: 200,
						message: 'success',
						result: 1,
						success: true,
						timestamp: 1571296313981
					})
				}
			})
		}
	})
})
app.post('/api/cartList', (req, res) => {
	let { userId } = req.body;
	fs.readFile('./db/cartList.json', (err, data) => {
		let { result } = JSON.parse(data);
		let newData = result.find(item => item.id == userId);
		res.json({
			code: 200,
			cartList: newData,
			success: true,
			message: 'success'
		})
	})
})
app.post('/api/deleteGoods', (req, res) => {
	let { userId, index, type } = req.body;
	console.log(userId, index, type)
	fs.readFile('./db/cartList.json', (err, data) => {
		// let { result } = JSON.parse(data);
		let cartListTotal = JSON.parse(data);
		// let  { cartList } = cartListJSON.result.find(item => item.id == userId)
		let result = cartListTotal.result
		let  { cartList } = result.find(item => item.id == userId)
		// cartList.splice(index, 1)
		if(type === 0){
			cartList.splice(index, 1)
		}else if(type === 1){
			var i = cartList.length
			while(i--) {
				if(index.indexOf(i) > -1){
					cartList.splice(i, 1)
				}
			}
			console.log(cartList)
		}
		// console.log(cartListTotal)
		console.log(cartList)
		cartListTotal.result = result
		console.log(JSON.stringify(cartListTotal))
		// 序列化
		// fs.writeFile('./db/cartList.json', JSON.stringify(cartListJSON), (err) => {
		fs.writeFile('./db/cartList.json', JSON.stringify(cartListTotal), (err) => {
			if (!err) {
				res.json({
					code: 200,
					message: 'success',
					// cartList: cartList,
					result: 1,
					success: true,
					timestamp: 1571296313981
				})
			}else{
				console.log(err)
			}
		})
	})
})
app.post('/api/changeProductNum', (req, res) => {
	let { userId, index, num } = req.body;
	fs.readFile('./db/cartList.json', (err, data) => {
		let { result } = JSON.parse(data);
		let  { cartList } = cartListJSON.result.find(item => item.id == userId)
		cartList[index].productNum = num
		// 序列化
		fs.writeFile('./db/cartList.json', JSON.stringify(cartListJSON), (err) => {
			if (!err) {
				res.json({
					code: 200,
					message: 'success',
					// cartList: cartList,
					result: 1,
					success: true,
					timestamp: 1571296313981
				})
			}
		})
	})
})

app.listen(3000)