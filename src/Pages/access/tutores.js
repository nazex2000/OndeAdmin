import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon, Skeleton, Input, Select, Table, Divider, Button, Space, Modal, Form, notification } from "antd";
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    CloseOutlined,
    CheckOutlined,
} from "@ant-design/icons";
import { firebase } from '../../base';

const { Option } = Select;

const Tutor = () => {
    //variables
    const navigate = useNavigate();
    const [listGrades, setListGrades] = useState([]);
    const [nameFilter, setNameFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [category, setCategory] = useState("");
    const [unit, setUnit] = useState("");
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalDeleteText, setModalDeleteText] = useState('Desenha mesmo deletar este produto?');
    const [categoryData, setCategoryData] = useState([]);
    //Methods
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const db = firebase.firestore();
        const data = await db.collection("Tutores").get();
        const disciplines = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setListGrades(disciplines);
    };

    const showModalDelete = (record) => () => {
        formEdit.setFieldsValue(record);
        setOpenDelete(true);
    };
    const handleDeleteOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        firebase.firestore().collection("Tutores").doc(formEdit.getFieldValue('id')).delete().then(() => {
            notification.success({
                message: 'Success',
                description: 'Tutor deletado com sucesso'
            })
            fetchData();
        }
        ).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao deletar o tutor'
            })
        }).finally(() => {
            setOpenDelete(false);
            setConfirmLoading(false);
        });
    };
    const handleDeleteCancel = () => {
        setOpenDelete(false);
    };

    const showModalAdd = () => {
        form.resetFields();
        setOpenAdd(true);
    };

    const showEditDialog = (record) => () => {
        setOpenEdit(true);
        formEdit.setFieldsValue(record);
    };

    const handleAddOk = async (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        const email = form.getFieldValue('email');
        const password = 'tutor@2023'; // make sure to add a password field to your form
        try {
            // create user with email and password
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // add user data to firestore
            await firebase.firestore().collection("Tutores").add({
                name: form.getFieldValue('name'),
                telephone: form.getFieldValue('telephone'),
                mail: form.getFieldValue('email'),
                uid: user.uid,
                status: 'active',
                registedBy: firebase.auth().currentUser.uid,
            });

            notification.success({
                message: 'Success',
                description: 'Tutor registado com sucesso'
            });
            fetchData();
        } catch (error) {
            console.log(error);
            notification.error({
                message: 'Error',
                description: 'Erro ao registar o Tutor'
            });
        } finally {
            setOpenAdd(false);
            setConfirmLoading(false);
        }
    };

    const handleEditOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        firebase.firestore().collection("Tutores").doc(formEdit.getFieldValue('id')).update({
            name: formEdit.getFieldValue('name'),
            telephone: formEdit.getFieldValue('telephone'),
            mail: formEdit.getFieldValue('mail'),
        }).then(() => {
            notification.success({
                message: 'Success',
                description: 'Informação do tutor actualizada com sucesso'
            })
            fetchData();
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao actualizar a informação do Tutor'
            })
        }).finally(() => {
            setOpenEdit(false);
            setConfirmLoading(false);
        });
    };

    const handleActivateDeactivate = (record) => () => {
        firebase.firestore().collection("Tutores").doc(record.id).update({
            status: record.status === 'active' ? 'inactive' : 'active'
        }).then(() => {
            notification.success({
                message: 'Success',
                description: record.status === 'active' ? 'Conta tutor desactivado com sucesso' : 'Conta tutor activado com sucesso'
            })
            fetchData();
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao actualizar a conta tutor'
            })
        });
    };


    const handleAddCancel = () => {
        form.resetFields();
        setOpenAdd(false);
    };
    const handleEditCancel = () => {
        formEdit.resetFields();
        setOpenEdit(false);
    };
    const handleCategoryChange = (value) => {
        setCategory(value);
    };
    const handleUnitChange = (value) => {
        setUnit(value);
    };

    //Columns of the table
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            width: 100,
            key: "id",
        },
        {
            title: "Nome",
            dataIndex: "name",
        },
        {
            title: "Email",
            dataIndex: "mail",
            width: 200,
        },
        
        {
            title: "Status",
            dataIndex: "status",
            width: 90,
        },
        {
            title: "Actions",
            key: "actions",
            width: 140,
            render: (text, record) => (
                <Space size="middle">
                    <Button size="small" className="text-blue-600" type="link" onClick={showEditDialog(record)}>
                        <EditOutlined />
                    </Button>
                    <Button size="small" className="text-blue-600" type="link" onClick={handleActivateDeactivate(record)}>
                        {record.status === 'active' ? <CloseOutlined /> : <CheckOutlined />}
                    </Button>
                    <Button size="small" className="text-red-600" type="link" onClick={showModalDelete(record)}>
                        <DeleteOutlined />
                    </Button>
                </Space>
            ),
        },
    ];

    //Test Rows
    const productsData = [
        {
            id: 1,
            name: "Produto 1",
            category: "eletronics",
            price: 750,
            unit: "piece",
            stock: 10,
        },
        {
            id: 2,
            name: "Produto 2",
            category: "Categoria 2",
            stock: 5,
        },
        {
            id: 3,
            name: "Produto 3",
            category: "Categoria 1",
            stock: 2,
        },
    ];

    return (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-bold mb-4">
                <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={() => navigate('/acessos')} />
                Tutores
            </h1>
            <div className="px-4">

                <div className="flex gap-2 items-center mb-4">
                    <div className="flex items-center">
                        <Button onClick={showModalAdd} className="border-purple-600 text-purple-600 cursor-pointer hover:bg-green-200 mr-2">
                            Adcionar
                        </Button>
                        <Button className="border-purple-600 text-purple-600 cursor-pointer hover:bg-yellow-200 mr-2">
                            Importar
                        </Button>
                        <Button className="border-purple-600 text-purple-600 cursor-pointer hover:bg-purple-200">
                            Exportar
                        </Button>
                    </div>
                    <Divider type="vertical" className="h-8" />
                    <input
                        type="text"
                        placeholder="Search By Name"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                    <input
                        type="text"
                        placeholder="Search By ID"
                        value={idFilter}
                        onChange={(e) => setIdFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                </div>
                <Table
                    size="small"
                    dataSource={listGrades.filter(
                        (item) =>
                            item.name.includes(nameFilter) &&
                            item.id.toString().includes(idFilter)
                    )}
                    columns={columns}
                />
            </div>

            {/* Modal for Delete Products */}
            <Modal
                okButtonProps={{ danger: true }}
                title="Deletar Tutor"
                open={openDelete}
                onOk={handleDeleteOk}
                confirmLoading={confirmLoading}
                onCancel={handleDeleteCancel}
            >
                <p>{modalDeleteText}</p>
            </Modal>

            {/* Modal for Add Products */}
            <Modal
                okButtonProps={{ className: "bg-green-600 text-white-600 cursor-pointer hover:bg-green-200 mr-2" }}
                title="Adcionar Tutor"
                footer={[]}
                onCancel={handleAddCancel}
                open={openAdd}
                confirmLoading={confirmLoading}

            >
                <Form form={form} onSubmit={handleAddOk} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Nome"
                        rules={[{ required: true, message: "Please enter the name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="telephone"
                        label="Contacto"
                        rules={[{ required: true, message: "Please enter the contact number" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: "Please enter the email" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button className="bg-red-600 text-white mr-2" onClick={handleAddCancel}>Cancelar</Button>
                        <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading} onClick={handleAddOk}>Registar</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal for Edit Products */}
            <Modal
                okButtonProps={{ className: "bg-green-600 text-white-600 cursor-pointer hover:bg-green-200 mr-2" }}
                title="Editar Informação"
                footer={[]}
                onCancel={handleEditCancel}
                open={openEdit}
                confirmLoading={confirmLoading}
            >
                <Form form={formEdit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Nome"
                        rules={[{ required: true, message: "Please enter the product name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="telephone"
                        label="Contacto"
                        rules={[{ required: true, message: "Please enter the contact number" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="mail"
                        label="Email"
                        rules={[{ required: true, message: "Please enter the email" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button className="bg-red-600 text-white mr-2" onClick={handleEditCancel}>Cancelar</Button>
                        <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading} onClick={handleEditOk}>Editar</Button>
                    </Form.Item>
                </Form>
            </Modal>


        </div>
    );
}

export default Tutor;