export type CoremConfig = {
    schema : string,
    database : "mysql",
    credentials : {
        host : string,
        user : string,
        password : string,
        db_name : string
    }
}