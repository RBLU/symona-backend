CREATE USER symona IDENTIFIED BY symona;
GRANT CONNECT, RESOURCE, DBA TO symona;
GRANT CREATE SESSION symona;
GRANT UNLIMITED TABLESPACE TO symona;

CREATE USER syrius_adm IDENTIFIED BY syrius;
GRANT CONNECT, RESOURCE, DBA TO syrius_adm;
GRANT CREATE SESSION TO syrius_adm;
GRANT UNLIMITED TABLESPACE TO syrius_adm;




