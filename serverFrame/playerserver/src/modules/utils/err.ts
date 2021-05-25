export const ErrEnum = {
    OK: 200,
    login_failed: { code: 201, dis: "账号不存在，请注册账号" },
    register_failed: { code: 202, dis: "注册账号失败，请检查注册信息" },
    register_repeat: { code: 203, dis: "账号已存在" },
}