<template>
	<div class="layout-container">
		<m-header>
			<div slot="nav"></div>
		</m-header>
		<section class="w mt30 clearfix">
			<m-shelf :title="cartTitle">
				<div slot="content">
					<el-table ref="multipleTable" :data="cartList" tooltip-effect="dark" empty-text="" style="width: 100%">
						<el-table-column width="55" align="center">
							<template slot-scope="scope">
								<el-checkbox @change="handleCheckedChange" v-model="scope.row.isSelected"></el-checkbox>
							</template>
						</el-table-column>
					    <el-table-column label="商品信息" width="120">
						  <template slot-scope="scope">
							  <img :src="scope.row.productImageBig" style="width: 80px; height: 80px;"/>
						  </template>
					    </el-table-column>
						<el-table-column label="" width="430">
						  <template slot-scope="scope">{{ scope.row.productName }}</template>
						</el-table-column>
					    <el-table-column label="单价" width="120" align="center">
							<template slot-scope="scope">￥{{ scope.row.salePrice }}</template>
					    </el-table-column>
						<el-table-column label="数量" width="140" align="center">
							<template slot-scope="scope">
								<el-input-number v-model="scope.row.productNum" @change="handleChange(scope.$index)" :min="1" :max="100" size="mini"></el-input-number>
							</template>
						</el-table-column>
						<el-table-column label="小计" width="140" align="center">
							<template slot-scope="scope">￥{{ scope.row.salePrice * scope.row.productNum }}</template>
						</el-table-column>
						<el-table-column fixed="right" label="操作" width="140">
						  <template slot-scope="scope">
							<el-button
							  @click.native.prevent="deleteRow(scope.$index, cartList)"
							  type="text"
							  size="small">
							  移除
							</el-button>
						  </template>
						</el-table-column>
					</el-table>
					  <!-- <div style="height: 90px;"> -->
						  <el-row :gutter="20" style="height: 90px;">
						    <el-col :span="12">
								<div class="grid-content bg-purple" style="margin: 30px 0;">
									<el-checkbox v-model="checkAll" @change="handleCheckAllChange" label="全选" style="margin: 10px 20px 0px 20px;"></el-checkbox>
									<el-link type="info" :underline="false" @click="deleteSeletion">删除选中的商品</el-link>
								</div>
							</el-col>
						    <el-col :span="12">
								<div class="grid-content bg-purple-light">
									<el-row :gutter="20" type="flex" class="row-bg" justify="end">
									  <el-col :span="6">
										  <div class="grid-content bg-purple" style="padding-right: 20px; border-right: solid 1px gray;">
											  <p style="text-align: right;">已选择 <strong>{{CountSelectedNum}}</strong> 件商品</p>
											  <p style="text-align: right;">共计 <strong style="color: gray;">{{totalNum}}</strong> 件商品</p>
										  </div>
									  </el-col>
									  
									  <el-col :span="6">
										  <div class="grid-content bg-purple-light">
											  <p>应付总额：￥<strong>{{CountSelectedPrice}}</strong></p>
											  <p style="color: gray;">应付总额不含运费</p>
										  </div>
									  </el-col>
									  
									  <el-col :span="7"><div class="grid-content bg-purple"><el-button :disabled="CountSelectedNum > 0 ? false : true" :type="((CountSelectedNum > 0) ? 'primary' : 'info')" style="width: 130px; height: 50px;" >现在结算</el-button></div></el-col>
									</el-row>
								</div>
							</el-col>
						  </el-row>
					  <!-- </div> -->
					  
				</div>
			</m-shelf>
		</section>
	</div>
</template>

<script>
import MHeader from '@/common/MHeader'
import MShelf from '@/components/Shelf'
import { getStore } from "@/utils/storage"
import { mapState, mapMutations} from "vuex"
export default {
	data(){
		return{
			checkAll: false,   // 在购物车数组中添加多选框是否选中的布尔值
			checkedNum: 0,
			cartTitle: '购物清单',
			// selectedNum: 0,
			// allNum: Number,
			// selectedPrice: 0,
			multipleSelection: []
		}
		
	},
	components:{
		MHeader,
		MShelf
	},
	// created() {
	// 	console.log(this.cartList)
	// },
	computed:{
		...mapState(['cartList']),
		totalNum() {  // 全部商品数量变化
			// return (a && b) a和b都true时，返回b，a false时，返回false，b false时，返回false
		    return (
				this.cartList &&
				this.cartList.reduce((total, item) => {
					total += item.productNum;
					return total;
				}, 0)
			);
		},
		CountSelectedNum() {  //已选中商品数量的变化
			var num = 0;
			for (var i = 0; i < this.cartList.length; i++){
				if(this.cartList[i].isSelected === true) {
					num = num + this.cartList[i].productNum
				}
			}
			// this.selectedNum = num
			return num
		},
		CountSelectedPrice(){  //已选商品价格变化
			var price = 0;
			for (var i = 0; i < this.cartList.length; i++){
				if(this.cartList[i].isSelected === true) {
					// num = num + this.cartList[i].productNum
					price = price + this.cartList[i].productNum * this.cartList[i].salePrice
				}
			}
			// this.selectedPrice = price
			return price
		}
	},
	mounted() {
		// this.allNum = this.totalNum()
		// console.log(this.cartList)
	},
	methods: {
		...mapMutations(['SHOWCART', 'INITBUYCART', 'DELETECART', 'CHANGEPRODUCT']),
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		deleteRow(index, rows) {  //点击最后一列的删除
			this.$http.post('/api/deleteGoods', {
				userId: getStore('id'),
				index: index,
				type: 0 //多选框后删除的type为0
			})
			this.DELETECART({
				index: index, 
				type: 0,
			})
	        // rows.splice(index, 1);
			// this.CountSelectedNum()
			// this.CountSelectedPrice()
			// this.allNum = this.totalNum()
	    },
		handleCheckAllChange(val) {  //点击全选
			if(val === true){
				this.cartList.forEach((item, index, arr) => {
					item.isSelected = true
				})
			}else if(val === false){
				this.cartList.forEach((item, index, arr) => {
					item.isSelected = false
				})
			}
			// this.cartList.forEach((item, index, arr) => {
			// 	item.isSelected = !item.isSelected
			// })
			// console.log(this.cartList)
			// this.CountSelectedNum()
			// this.CountSelectedPrice()
		},
		handleCheckedChange(value) {  //点击多选框
			var isAll = this.cartList.find(item => item.isSelected === false);
			this.checkAll = isAll === undefined
			// this.CountSelectedNum()
			// this.CountSelectedPrice()
		},
		deleteSeletion() {  //点击删除商品
			console.log(this.cartList)
			if(this.cartList.length > 0){
				var length = this.cartList.length - 1;
				var arrIndex = []
				for(var i = length; i > -1; i--){
					if(this.cartList[i].isSelected === true) {
						arrIndex.push(i)
						// this.cartList.splice(i, 1)
						// console.log(i)
					}
				}
				this.$http.post('/api/deleteGoods', {
					userId: getStore('id'),
					index: arrIndex,
					type: 1 //全选旁边的删除按钮type为1
				})
				this.DELETECART({
					index: arrIndex, 
					type: 1,
				})
				console.log(this.cartList)
			}
			// this.CountSelectedNum()
			// this.CountSelectedPrice()
			// this.allNum = this.totalNum()
		},
		handleChange(index){  //计数器数字变化
			// if(currentValue > oldValue) {
			// 	// this.allNum = this.allNum + 1
			// }else if(currentValue < oldValue){
			// 	// this.allNum = this.allNum - 1
			// }
			// this.CountSelectedNum()
			// this.CountSelectedPrice()
			// console.log(value)
			var num = this.cartList[index].productNum;
			
			this.$http.post('/api/changeProductNum', {
				userId: getStore('id'),
				index: index,
				num: num
			})
			// console.log(this.cartList)
			// console.log(index)
			console.log(num)
			this.CHANGEPRODUCT({
				index: index,
				number: num,
			})
		}
	}
}
</script>

<style lang="scss" scoped>
@import "../../assets/style/mixin";

.w {
  padding-top: 40px;
}

.mt30 {
  margin-top: 30px;
}

.content {
  display: flex;
  height: 100%;
}

.account-sidebar {
  width: 210px;
  border-radius: 6px;
  .avatar {
    padding-top: 20px;
    border-radius: 10px;
    text-align: center;
    img {
      width: 168px;
      height: 168px;
    }
    h5 {
      font-size: 18px;
      line-height: 48px;
      font-weight: 700;
    }
  }
  .account-nav {
    padding-top: 15px;
    li {
      position: relative;
      height: 48px;
      border-top: 1px solid #ebebeb;
      line-height: 48px;
      &:hover {
        a {
          position: relative;
          z-index: 1;
          height: 50px;
          background-color: #98afee;
          line-height: 50px;
          color: #fff;
        }
      }
      a {
        display: block;
      }
      &.current {
        a {
          position: relative;
          z-index: 1;
          height: 50px;
          background-color: #98afee;
          line-height: 50px;
          color: #fff;
        }
      }
    }
  }
}

.account-content {
  margin-left: 20px;
  flex: 1;
}

.el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  
 //  .bg-purple {
 //    background: #d3dce6;
	
 //  }
 //  .bg-purple-light {
 //    background: #e5e9f2;
 //  }
  .grid-content {
    // border-radius: 4px;
    min-height: 36px;
	
  }
  .row-bg {
    padding: 25px 0;
    // background-color: #f9fafc;
  }
  p>strong{
	  font-size: 18px;
  }
  strong:first-child{
	  color: #DC143C;
  }
// .grid-content .bg-purple > button {
// 	width: 130px; 
// 	height: 50px;
// 	background-color: #0074D9;
// 	color: white;
// 	border-radius: 5%;
// 	font-size: 16px;
// }
</style>

