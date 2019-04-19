#!/usr/bin/env python
#-*- coding:utf8 -*-

import os, json, tarfile, shutil

PACKAGE_DIR = 'package'

def func():
    package_json = json.loads(open('package.json').read())

    try:
        shutil.rmtree(PACKAGE_DIR)
    except:
        pass

    os.mkdir(PACKAGE_DIR)

    for f in package_json['files'] + ['package.json']:
        if os.path.isdir(f):
            shutil.copytree(f, '%s/%s' % (PACKAGE_DIR, f))
        elif os.path.exists(f):
            shutil.copy(f, PACKAGE_DIR)

    with tarfile.open(name='react-native-%s.tgz' % package_json['version'],
            mode='w:gz') as tar:
        tar.add(PACKAGE_DIR, exclude=lambda x:x.endswith('xcuserdata'))

    shutil.rmtree(PACKAGE_DIR)

func()
