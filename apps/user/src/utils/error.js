import Taro from "@tarojs/taro";
export const formErrorToaster = function (error) {
    var zod_text = ''
    if (typeof error.format === 'function') {
        zod_text = error.format()?._errors?.join(';\n')
    }
    Taro.showToast({
        title: zod_text || error.message,
        icon: 'error'
    });
}