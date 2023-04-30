export interface CreateUserInputDTO{
    name: string,
    email:string,
    password:string,
    role:string
}

export interface CreateUserOutputDTO{
    message: string,
    user:{
        id: string,
        name: string,
        createdAt: string
    }
}