const to = require('await-to-js').default;
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const { CONST } = require('../../constants/const');
const bcrypt = require('bcrypt');
const { ApiResponse } = require('../../helper/response/Api_Response');
const version = 1;


module.exports = {
    login: async (req, res) => {
        try {
            let { user_name, password } = req.body;
            let error, result;

            [error, result] = await to(authService.login(user_name, password));
            if (error) {
                return ApiResponse(res, 400, error, {}, version);
            }
            else {
                let payload = {
                    exp: Date.now() + 30000 * 60 * 1000,
                    userId: result._id
                };

                let access_token = await jwt.sign(payload, CONST.JWT_SCRET);

                result.password = "";
                
                return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS,result, version);
            }
        } catch (error) {
            return ApiResponse(res, 400, CONST.MESSAGE.ERROR, {}, version);
        }

    },
    register: async (req, res) => {
        try {
            let { password, confirm_password } = req.body;

            let error, result;

            [error, result] = await to(authService.check_password(password, confirm_password));

            if (error) {
                return ApiResponse(res, 400, error, {}, version);
            } else {

                    req.body.password = await bcrypt.hash(password, 10);
                    await authService.register(req.body);
                    return ApiResponse(res, 200, CONST.MESSAGE.SUCCESS, {}, version);
            }
        } catch (error) {
            return ApiResponse(res, 500, CONST.MESSAGE.ERROR, {}, version);
        }
    }
}