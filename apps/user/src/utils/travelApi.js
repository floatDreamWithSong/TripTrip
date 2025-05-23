// src/utils/travelApi.js
import Taro from '@tarojs/taro';

export async function submitTravel({ title, value, images, videoFile, agreement, tags }) {
  try {
    const formData = new FormData();

    formData.append('title', title);
    formData.append('content', value);

    // 处理tags数组
    if (Array.isArray(tags)) {
      tags.forEach(tag => {
        formData.append('tags[]', tag);
      });
    } else if (tags) {
      formData.append('tags[]', tags);
    }

    console.log("准备提交的图片列表：", images);

    if (images.length > 0) {
      const coverImage = images[0];
      const coverFile = coverImage.originFileObj;

      if (coverFile instanceof File) {
        formData.append('cover', coverFile); // ✅ 上传封面
        console.log('添加封面图片:', coverFile.name);
      } else {
        console.warn('封面图没有 originFileObj');
      }

      // const otherImages = images.slice(1);
      images.forEach((image, index) => {
        const file = image.originFileObj;
        if (file instanceof File) {
          formData.append('images', file); // ✅ 其他图片上传
          console.log(`添加图片 ${index + 1}:`, file.name);
        } else {
          console.warn(`第 ${index + 2} 张图片没有 originFileObj`);
        }
      });
    }


    if (videoFile instanceof File) {
      formData.append('video', videoFile);
      console.log('添加视频文件:', videoFile.name);
    }

    console.log('FormData内容：');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    if (!title.trim()) {
      Taro.showToast({ title: '标题不能为空', icon: 'none', duration: 2000 });
      return false;
    }

    if (!value.trim()) {
      Taro.showToast({ title: '内容不能为空', icon: 'none', duration: 2000 });
      return false;
    }

    if (images.length === 0) {
      Taro.showToast({ title: '请上传图片', icon: 'none', duration: 2000 });
      return false;
    }

    if (!agreement) {
      Taro.showToast({ title: '请同意发布规则', icon: 'none', duration: 2000 });
      return false;
    }
    const Authorization = await Taro.getStorage({ key: 'accessToken' }).then(res => res.data).catch(() => '')
    const X_Refresh_Token = await Taro.getStorage({ key: 'refreshToken' }).then(res => res.data).catch(() => '')
    console.log('Authorization', Authorization)
    console.log('X_Refresh_Token', X_Refresh_Token)
    const response = await fetch('https://daydreamer.net.cn/passage/user', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': Authorization,
        'X-Refresh-Token': X_Refresh_Token,
      }
    });

    const result = await response.json();

    if (response.ok) {
      Taro.showToast({ title: '发布成功', icon: 'success', duration: 2000 });
      console.log('发布成功:', result);
      return true;
    } else {
      Taro.showToast({ title: '发布失败', icon: 'none', duration: 2000 });
      console.error('后端错误:', result);
      return false;
    }
  } catch (err) {
    Taro.showToast({ title: '网络异常', icon: 'none', duration: 2000 });
    console.error('网络异常:', err);
    return false;
  }
}

// 获取当前用户的游记列表
export async function fetchMyPassages() {
  const Authorization = await Taro.getStorage({ key: 'accessToken' }).then(res => res.data).catch(() => '')
  const X_Refresh_Token = await Taro.getStorage({ key: 'refreshToken' }).then(res => res.data).catch(() => '')

  try {
    const res = await Taro.request({
      url: 'https://daydreamer.net.cn/passage/user',
      method: 'GET',
      headers: {
        'Authorization': Authorization,
        'X-Refresh-Token': X_Refresh_Token
      }
    })

    if (res.statusCode === 200 && res.data.code === 0) {
      return res.data.data
    } else {
      console.error('请求失败:', res.data.message)
      Taro.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      }, 2000);
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 2000)
      return []
    }
  } catch (error) {
    console.error('请求出错:', error)
    return []
  }
}

export async function deletePassage(passageId) {
  const Authorization = await Taro.getStorage({ key: 'accessToken' }).then(res => res.data).catch(() => '')
  const X_Refresh_Token = await Taro.getStorage({ key: 'refreshToken' }).then(res => res.data).catch(() => '')

  try {
    // 向后端发送 DELETE 请求
    const response = await Taro.request({
      url: 'https://daydreamer.net.cn/passage', // 后端API地址
      method: 'DELETE',
      data: {
        passageId: passageId, // 传递 passageId 参数
        headers: {
          'Authorization': Authorization,
          'X-Refresh-Token': X_Refresh_Token
        }
      },
    });

    console.log('删除成功', response);
    return response; // 返回删除成功的响应
  } catch (error) {
    console.error('删除失败:', error);
    return Promise.reject(error); // 返回错误信息
  }
}

export async function modifyPassage(params) {
  const Authorization = await Taro.getStorage({ key: 'accessToken' }).then(res => res.data).catch(() => '')
  const X_Refresh_Token = await Taro.getStorage({ key: 'refreshToken' }).then(res => res.data).catch(() => '')

  try {
    const response = await Taro.request({
      url: 'https://daydreamer.net.cn/passage/user', // 你的后端API地址
      method: 'PUT',
      data: params,
      headers: {
        'Authorization': Authorization,
        'X-Refresh-Token': X_Refresh_Token,
      },
    });

    if (response.statusCode === 200) {
      console.log('修改游记成功', response.data);
      return response.data;
    } else {
      console.error('修改游记失败', response);
      throw new Error(response.data.message || '修改游记失败');
    }
  } catch (error) {
    console.error('修改游记请求错误:', error);
    throw error;
  }
}
