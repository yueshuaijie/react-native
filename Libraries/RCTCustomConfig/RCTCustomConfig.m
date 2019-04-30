//
//  RCTCustomConfig.m
//  xyqcbg2
//
//  Created by cc on 2018/2/27.
//  Copyright © 2018年 netease. All rights reserved.
//

#import "RCTCustomConfig.h"

@implementation CBGRefreshConfig

+ (RCTCustomConfig *)sharedConfig {
    static RCTCustomConfig * sharedConfig = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedConfig = [[RCTCustomConfig alloc] init];
        sharedConfig.imgPrefix = @"cbg";
        sharedConfig.loadingWH = 75;
        sharedConfig.imgCount = 15;
    });
    return sharedConfig;
}

@end
