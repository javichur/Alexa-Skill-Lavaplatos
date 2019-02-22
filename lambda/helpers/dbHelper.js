/* dbHelper.js
 * Author: Javier Campos (https://javiercampos.es)
* Version: 2.3 (20/02/2019)
 */
var AWS = require("aws-sdk");


class DBHelper {
    constructor(tableName, primaryKeyName, primarySortKeyName) {
        this.tableName = tableName;
        this.primaryKeyName = primaryKeyName;
        this.primarySortKeyName = primarySortKeyName;

        this.docClient = new AWS.DynamoDB.DocumentClient(); // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
    }

    /*
    * GET ITEM
    */
    getItemWithPrimarySortKey(primaryKeyValue, primarySortKeyValue){
        return new Promise((resolve, reject) => {
            const params = {
                TableName: this.tableName
            };

            params.Key = this.createKey(primaryKeyValue, primarySortKeyValue);

            this.docClient.get(params, function(err, data) {
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                    return reject(JSON.stringify(err, null, 2));
                } 
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data.Item);
            });
        });
    }

    getItem(primaryKeyValue){
        return this.getItemWithPrimarySortKey(primaryKeyValue, null);
    }

    /*
    * ADD
    */
    addItemWithPrimarySortKey(primaryKeyValue, primarySortKeyValue, itemAttributes){
        return new Promise((resolve, reject) => {
            const params = {
                TableName: this.tableName
            };

            params.Item = this.createKey(primaryKeyValue, primarySortKeyValue);

            // Add properties
            for(var i=0; i< Object.keys(itemAttributes).length; i++){
                var name = Object.keys(itemAttributes)[i];
                params.Item[name] = itemAttributes[name];
            }

            this.docClient.put(params, (err, data) => {
                if (err) {
                    console.log("Unable to insert =>", JSON.stringify(err));
                    return reject("Unable to insert. " + err);
                }
                console.log("Saved Data, ", JSON.stringify(data));
                resolve(data);
            });
        });
    }

    addItem(primaryKeyValue, itemAttributes){
        return this.addItemWithPrimarySortKey(primaryKeyValue, null, itemAttributes);
    }


    /*
    * DELETE
    */
    deleteItemWithPrimarySortKey(primaryKeyValue, primarySortKeyValue){
        return new Promise((resolve, reject) => {
            const params = {
                TableName: this.tableName
            };

            params.Key = this.createKey(primaryKeyValue, primarySortKeyValue);
            
            this.docClient.delete(params, function (err, data) {
                if (err) {
                    console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                    return reject(JSON.stringify(err, null, 2));
                }            
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                resolve();
            });
        });
    }

    deleteItem(primaryKeyValue){
        return this.deleteItemWithPrimarySortKey(primaryKeyValue, null);
    }


    /*
    * UPDATE
    */
    updateItemWithPrimarySortKey(primaryKeyValue, primarySortKeyValue, itemAttributesToChange){
        return new Promise((resolve, reject) => {
            const params = {
                TableName: this.tableName
            };

            params.Key = this.createKey(primaryKeyValue, primarySortKeyValue);

            let strUpdateExpression = "set";
            params.ExpressionAttributeValues = {};
            for(var i=0; i< Object.keys(itemAttributesToChange).length; i++){
                var name = Object.keys(itemAttributesToChange)[i];

                strUpdateExpression += " " + name + " = :" + name + "_value";
                params.ExpressionAttributeValues[":" + name + "_value"] = itemAttributesToChange[name];
            }

            params.UpdateExpression = strUpdateExpression;
            params.ReturnValues = "UPDATED_NEW";
            
           this.docClient.update(params, function(err, data) {
                if (err) {
                    console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    return reject(JSON.stringify(err, null, 2));
                }            
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve();
            });
        });
    }

    updateItem(primaryKeyValue, itemAttributesToChange){
        return this.updateItemWithPrimarySortKey(primaryKeyValue, null, itemAttributesToChange);
    }


    createKey(primaryKeyValue, primarySortKeyValue){
        let ret = {};
        ret[this.primaryKeyName] = primaryKeyValue; // add key
        if(primarySortKeyValue) ret[this.primarySortKeyName] = primarySortKeyValue; // add sort key (optional)

        return ret;
    }
}

module.exports = DBHelper;