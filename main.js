//import oracledb from 'oracledb';
import { user, password, connectionString } from './dbconfig.js';
import  path from 'path';
import csvtojsonV2 from 'csvtojson';
import XLSX from 'xlsx';
const table=process.argv[2];
const filePath=process.argv[3];
const fileExt = path.extname(filePath);
let connection;
let data;

if(fileExt ==='.xlsx'){
    //data = xlsx(filePath);
    data = xlsx(filePath);
    insert(table,data);
} else if(fileExt ==='.csv'){
    data = csv(filePath);
    insert(table,data);
}
else{
    console.log('File format not supported');
}


async function csv(filePathx){
    const jsonArray=await csvtojsonV2().fromFile(filePathx);
    console.log(jsonArray);
    return jsonArray;
}

async function  xlsx(path){
    var workbook = XLSX.readFile(path);
var sheet_name_list = workbook.SheetNames;
sheet_name_list.forEach(function(y) {
    var worksheet = workbook.Sheets[y];
    var headers = {};
    var data = [];
    for(let z in worksheet) {
        if(z[0] === '!') continue;
        //parse out the column, row, and value
        var tt = 0;
        for (var i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                tt = i;
                break;
            }
        };
        var col = z.substring(0,tt);
        var row = parseInt(z.substring(tt));
        var value = worksheet[z].v;

        //store header names
        if(row == 1 && value) {
            headers[col] = value;
            continue;
        }

        if(!data[row]) data[row]={};
        data[row][headers[col]] = value;
    }
    data.shift();
    data.shift();
    console.log(data);
    return data;
});
}
async function insert(table,values){
    try {
    connection = await oracledb.getConnection({ user, password, connectionString });
    console.log("Successfully connected to Oracle Database");
    if (table === 'FIND_ENTITY') {
        for (const value of values) {
            // const query = 'insert into FIND_ENTITY (ENTITY_CODE,ENTITY_NAME,TAX_NO,COUNTRY_ID,CITY_ID,TOWN_ID,ADDRESS1) values (:1,:2,:3,:4,:5,:6,:7)';
            // const binds = [value.ENTITY_CODE, value.ENTITY_NAME, value.TAX_NO, value.COUNTRY_ID, value.CITY_ID, value.TOWN_ID, value.ADDRESS1];
            const sql = `INSERT INTO FIND_ENTITY VALUES (:ENTITY_CODE, :ENTITY_NAME, :TAX_NO, :COUNTRY_ID, :CITY_ID, :TOWN_ID, :ADDRESS1)`;
            const result = await connection.execute(
                sql,
                value,
                { autoCommit: true }
                );
                console.log("GIDEN DATA",result);
        }

        console.log("DDD", values);
    } else{
    for(const value of values) { 
        await connection.execute(
            `INSERT INTO ${table} (po_document) VALUES (:bv)`,
            { bv: {val: value, type: oracledb.DB_TYPE_JSON} }
        );
    }
}
    if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }

    }catch (err) {   
    console.error(err);
    }
} 

function convertExcelFileToJsonUsingXlsx() {
    const file = XLSX.readFile(filePath);
    const sheetNames = file.SheetNames;
    const totalSheets = sheetNames.length;
    let parsedData = [];
    for (let i = 0; i < totalSheets; i++) {
        const tempData = XLSX.utils.sheet_to_json(file.Sheets[sheetNames[i]]);
        tempData.shift();
        parsedData.push(...tempData);
    }
    console.log(parsedData);
return parsedData;
}