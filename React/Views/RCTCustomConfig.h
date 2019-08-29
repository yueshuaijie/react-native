//
//  RCTCustomConfig.h
//  xyqcbg2
//
//  Created by cc on 2018/2/27.
//  Copyright © 2018年 netease. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface RCTCustomConfig : NSObject

+ (RCTCustomConfig *)sharedConfig;

// 图片前缀
@property (nonatomic, strong) NSString *imgPrefix;

// 图片宽度
@property (nonatomic, assign) double loadingWH;

// 图片数量
@property (nonatomic, assign) double imgCount;

@end
