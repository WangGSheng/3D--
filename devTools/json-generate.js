/************
 * faker
 * Created by donkey on 2017/9/4
 * https://github.com/marak/faker.js/
 ************/

var _ = require('lodash');
var faker = require('faker');  //生成模拟数据

faker.locale = "zh_CN";

function one(){
    return {
        people : _.times(20, function(n){
            return {
                cost        : n,
                name        : faker.name.findName().replace(/ /g, ''),
                code        : faker.address.zipCode(),
                PhoneNumber : faker.phone.phoneNumber(),
                avatar      : faker.internet.avatar(),
                company     : faker.company.companyName(),
                date        : faker.date.recent()
            }
        })
    }
}

function two(){
    return {
        people : _.times(10, function(n){
            return {
                cost        : n,
                name        : faker.name.findName().replace(/ /g, ''),
                code        : faker.address.zipCode(),
                PhoneNumber : faker.phone.phoneNumber(),
                avatar      : faker.internet.avatar(),
                company     : faker.company.companyName(),
                date        : faker.date.recent()
            }
        })
    }
}


module.exports.one = one;
module.exports.two = two;
