from app import app, db
import os

def init_database():
    with app.app_context():
        db.create_all()
        print("数据库表创建成功！")
        
        from app import User
        if User.query.count() == 0:
            sample_users = [
                User(name="张三", email="zhangsan@example.com"),
                User(name="李四", email="lisi@example.com"),
                User(name="YWXstrong", email="w162675761@qq.com")
            ]
            
            for user in sample_users:
                db.session.add(user)
            
            db.session.commit()
            print("示例数据添加成功！")
        else:
            print(f"数据库中已有 {User.query.count()} 条用户记录")
            
if __name__ == '__main__':
    init_database()
