export interface UserLoginInterface {
    username: string;
    password: string;
}
export interface UserRegisterInterface {
    username: string;
    password: string;
    email: string;
    verifyCode: string;
}
export interface sendEmailInterface {
    email: string;
}